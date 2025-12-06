import { NextRequest, NextResponse } from "next/server";

interface FormSubmission {
  name: string;
  email: string;
  message: string;
  intent: string;
  timestamp: string;
}

interface GistFile {
  filename: string;
  content?: string;
  raw_url?: string;
  truncated?: boolean;
  size?: number;
}

interface GitHubGist {
  id: string;
  description: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  files: Record<string, GistFile>;
}

interface ContactGist extends FormSubmission {
  gistId: string;
  gistUrl: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to get authentication header
function getAuthHeader(token: string): string {
  return token.startsWith("ghp_") || token.startsWith("github_pat_")
    ? `Bearer ${token}`
    : `token ${token}`;
}

// Helper function to fetch gists from GitHub API
async function fetchGists(token: string, perPage = 100): Promise<GitHubGist[]> {
  const authHeader = getAuthHeader(token);
  const response = await fetch(
    `https://api.github.com/gists?per_page=${perPage}`,
    {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Portfolio-Contact-Form",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

// Helper function to fetch individual gist with full content
async function fetchIndividualGist(
  gistId: string,
  token: string
): Promise<GitHubGist | null> {
  try {
    const authHeader = getAuthHeader(token);
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        Authorization: authHeader,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Portfolio-Contact-Form",
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching individual gist:", error);
    return null;
  }
}

// Helper function to fetch full content from raw URL if truncated
async function fetchGistFileContent(
  file: GistFile,
  gistId: string,
  token: string
): Promise<string | null> {
  try {
    // If content exists and not truncated, use it
    if (file.content && !file.truncated) {
      return file.content;
    }

    // If truncated, fetch individual gist which always has full content
    const fullGist = await fetchIndividualGist(gistId, token);
    if (fullGist) {
      const fullFile = Object.values(fullGist.files).find(
        (f) => f.filename === file.filename
      );
      if (fullFile?.content) {
        return fullFile.content;
      }
    }

    // Fallback: try raw_url (may not work for private gists)
    if (file.raw_url) {
      const authHeader = getAuthHeader(token);
      const response = await fetch(file.raw_url, {
        headers: {
          Authorization: authHeader,
          Accept: "text/plain",
          "User-Agent": "Portfolio-Contact-Form",
        },
      });

      if (response.ok) {
        return await response.text();
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching gist file content:", error);
    return null;
  }
}

// Helper function to parse gist content
async function parseGistContent(
  gist: GitHubGist,
  token: string
): Promise<FormSubmission | null> {
  try {
    // Find the contact submission file
    const file = Object.values(gist.files).find((f) =>
      f.filename.startsWith("contact-submission-")
    );

    if (!file) return null;

    // Get full content (handles truncated files)
    const contentText = await fetchGistFileContent(file, gist.id, token);
    if (!contentText) return null;

    // Parse JSON content
    const content = JSON.parse(contentText);
    return {
      name: content.name,
      email: content.email,
      message: content.message,
      intent: content.intent,
      timestamp: content.timestamp,
    };
  } catch (error) {
    console.error("Error parsing gist content:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, intent } = body;

    // Validate required fields
    if (!name || !email || !message || !intent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get GitHub token from environment variable
    const githubToken = process.env.GITHUB_GIST_TOKEN;

    if (!githubToken) {
      console.error("GITHUB_GIST_TOKEN is not set in environment variables");
      return NextResponse.json(
        {
          error:
            "Server configuration error: GitHub token not configured. Please set GITHUB_GIST_TOKEN in your environment variables.",
        },
        { status: 500 }
      );
    }

    // Prepare form submission data
    const submission: FormSubmission = {
      name,
      email,
      message,
      intent,
      timestamp: new Date().toISOString(),
    };

    // Format the gist content as JSON
    const gistContent = JSON.stringify(submission, null, 2);

    // Create filename with timestamp for uniqueness
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `contact-submission-${timestamp}.json`;

    // Create gist via GitHub API
    const authHeader = getAuthHeader(githubToken);

    const gistResponse = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Portfolio-Contact-Form",
      },
      body: JSON.stringify({
        description: `Contact Form Submission from ${name} (${intent})`,
        public: false, // Private gist to protect user data
        files: {
          [filename]: {
            content: gistContent,
          },
        },
      }),
    });

    if (!gistResponse.ok) {
      let errorMessage = "Failed to save submission";
      const errorText = await gistResponse.text();

      try {
        const errorData = JSON.parse(errorText);
        console.error("GitHub API Error:", errorData);

        // Provide more specific error messages
        if (gistResponse.status === 401) {
          errorMessage =
            "Authentication failed. Please check your GitHub token.";
        } else if (gistResponse.status === 403) {
          errorMessage =
            "Permission denied. Ensure your token has 'gist' scope.";
        } else if (errorData.message) {
          errorMessage = `GitHub API error: ${errorData.message}`;
        }
      } catch (parseError) {
        console.error("GitHub API Error (text):", errorText);
        errorMessage = `GitHub API returned status ${gistResponse.status}`;
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const gistData = await gistResponse.json();

    return NextResponse.json(
      {
        success: true,
        message: "Form submitted successfully",
        gistId: gistData.id,
        gistUrl: gistData.html_url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing form submission:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        error: `An unexpected error occurred: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get GitHub token from environment variable
    const githubToken = process.env.GITHUB_GIST_TOKEN;

    if (!githubToken) {
      console.error("GITHUB_GIST_TOKEN is not set in environment variables");
      return NextResponse.json(
        {
          error:
            "Server configuration error: GitHub token not configured. Please set GITHUB_GIST_TOKEN in your environment variables.",
        },
        { status: 500 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const intent = searchParams.get("intent") || null;
    const perPage = Math.min(limit, 100); // GitHub API max is 100

    // Fetch all gists
    const gists = await fetchGists(githubToken, perPage);

    // Filter and parse contact form submissions
    const contactGists: ContactGist[] = [];

    // Process gists in parallel for better performance
    // Identify contact submissions by filename pattern (more reliable than description)
    const promises = gists
      .filter((gist) => {
        // Check if any file in the gist matches the contact submission pattern
        return Object.keys(gist.files || {}).some((filename) =>
          filename.startsWith("contact-submission-")
        );
      })
      .map(async (gist) => {
        // Parse the gist content
        const submission = await parseGistContent(gist, githubToken);
        if (!submission) return null;

        // Filter by intent if provided
        if (intent && submission.intent !== intent) {
          return null;
        }

        return {
          ...submission,
          gistId: gist.id,
          gistUrl: gist.html_url,
          createdAt: gist.created_at,
          updatedAt: gist.updated_at,
        };
      });

    // Wait for all parsing to complete and filter out nulls
    const results = await Promise.all(promises);
    contactGists.push(
      ...results.filter((gist): gist is ContactGist => gist !== null)
    );

    // Sort by timestamp (newest first)
    contactGists.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply limit
    const limitedGists = contactGists.slice(0, limit);

    return NextResponse.json(
      {
        success: true,
        count: limitedGists.length,
        total: contactGists.length,
        gists: limitedGists,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching gists:", error);

    let errorMessage = "Failed to fetch submissions";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Check if it's an authentication error
    if (errorMessage.includes("401") || errorMessage.includes("403")) {
      return NextResponse.json(
        {
          error:
            "Authentication failed. Please check your GitHub token has 'gist' scope.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: `An unexpected error occurred: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
