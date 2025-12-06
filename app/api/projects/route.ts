import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_GIST_TOKEN;
const GIST_FILENAME = "projects-list";

// Helper function to get authentication header (consistent with contact route)
function getAuthHeader(token: string): string {
  return token.startsWith("ghp_") || token.startsWith("github_pat_")
    ? `Bearer ${token}`
    : `token ${token}`;
}

export async function GET() {
  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "Server configuration error: GitHub token not configured" },
      { status: 500 }
    );
  }

  try {
    const authHeader = getAuthHeader(GITHUB_TOKEN);

    // 1. Fetch user's gists to find our database file (fetch multiple pages if needed)
    let allGists: any[] = [];
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore && page <= 3) {
      // Fetch up to 3 pages (300 gists max)
      const gistsRes = await fetch(
        `https://api.github.com/gists?per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: authHeader,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Portfolio-Projects-CMS",
          },
        }
      );

      if (!gistsRes.ok) {
        throw new Error(`GitHub API error: ${gistsRes.status}`);
      }

      const gists = await gistsRes.json();
      allGists = [...allGists, ...gists];

      // If we got less than perPage, we've reached the end
      if (gists.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }
    }

    const gists = allGists;

    // 2. Find the gist containing 'projects-list' (check filename or description)
    const dbGist = gists.find((g: any) => {
      if (!g.files) return false;

      // Check for exact filename match first
      if (g.files[GIST_FILENAME]) return true;

      // Check case-insensitive filename match
      const fileKeys = Object.keys(g.files);
      const filenameMatch = fileKeys.some(
        (key) => key.toLowerCase() === GIST_FILENAME.toLowerCase()
      );
      if (filenameMatch) return true;

      // Check if description matches (for cases where GitHub auto-named the file)
      const descMatch =
        g.description?.toLowerCase().includes("projects-list") ||
        g.description?.toLowerCase().includes("projects");
      if (descMatch && fileKeys.length > 0) return true;

      return false;
    });

    if (!dbGist) {
      // Log available gist filenames for debugging
      console.log(
        "Available gists:",
        gists.map((g: any) => ({
          id: g.id,
          description: g.description,
          files: g.files ? Object.keys(g.files) : [],
        }))
      );
      // If not found, return empty (Frontend will use seed data)
      return NextResponse.json({ found: false, data: [] });
    }

    // Get the actual filename (might be case-different or auto-named by GitHub)
    const actualFilename =
      dbGist.files[GIST_FILENAME]?.filename ||
      Object.keys(dbGist.files).find(
        (key) => key.toLowerCase() === GIST_FILENAME.toLowerCase()
      ) ||
      Object.keys(dbGist.files)[0] || // Use first file if description matched
      GIST_FILENAME;

    // 3. Fetch the raw content (use individual gist endpoint for private gists)
    // This ensures we get full content even for private gists
    const gistDetailRes = await fetch(
      `https://api.github.com/gists/${dbGist.id}`,
      {
        headers: {
          Authorization: authHeader,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Portfolio-Projects-CMS",
        },
      }
    );

    if (!gistDetailRes.ok) {
      throw new Error(`Failed to fetch gist details: ${gistDetailRes.status}`);
    }

    const gistDetail = await gistDetailRes.json();
    const file =
      gistDetail.files[actualFilename] ||
      gistDetail.files[GIST_FILENAME] ||
      Object.values(gistDetail.files).find(
        (f: any) => f.filename?.toLowerCase() === GIST_FILENAME.toLowerCase()
      );

    if (!file || !file.content) {
      console.log("Gist found but file content is empty:", {
        gistId: dbGist.id,
        availableFiles: Object.keys(gistDetail.files || {}),
      });
      return NextResponse.json({ found: false, data: [] });
    }

    // Parse the JSON content
    const data = JSON.parse(file.content);

    return NextResponse.json({
      found: true,
      gistId: dbGist.id,
      data: Array.isArray(data) ? data : [],
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch projects";
    return NextResponse.json(
      { error: `Failed to fetch projects: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "Server configuration error: GitHub token not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { projects, gistId } = body;

    // Validate input
    if (!projects || !Array.isArray(projects)) {
      return NextResponse.json(
        { error: "Invalid request: projects must be an array" },
        { status: 400 }
      );
    }

    const authHeader = getAuthHeader(GITHUB_TOKEN);
    const content = JSON.stringify(projects, null, 2);

    // If we have a gistId, update it. If not, create a new Gist.
    const url = gistId
      ? `https://api.github.com/gists/${gistId}`
      : "https://api.github.com/gists";

    const method = gistId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: authHeader,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Portfolio-Projects-CMS",
      },
      body: JSON.stringify({
        description: "Portfolio Projects Database (CMS)",
        public: false, // Keep it private
        files: {
          [GIST_FILENAME]: { content },
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = "GitHub API Error";

      try {
        const errorData = JSON.parse(errorText);
        if (res.status === 401) {
          errorMessage =
            "Authentication failed. Please check your GitHub token.";
        } else if (res.status === 403) {
          errorMessage =
            "Permission denied. Ensure your token has 'gist' scope.";
        } else if (errorData.message) {
          errorMessage = `GitHub API error: ${errorData.message}`;
        }
      } catch (parseError) {
        errorMessage = `GitHub API returned status ${res.status}`;
      }

      throw new Error(errorMessage);
    }

    const json = await res.json();

    return NextResponse.json({
      success: true,
      gistId: json.id,
      message: gistId
        ? "Projects updated successfully"
        : "Projects created successfully",
    });
  } catch (error) {
    console.error("Error saving projects:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to save projects";
    return NextResponse.json(
      { error: `Failed to save: ${errorMessage}` },
      { status: 500 }
    );
  }
}
