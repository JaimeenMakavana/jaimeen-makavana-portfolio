import { NextRequest, NextResponse } from "next/server";
import type { Project } from "@/app/components/ProjectComponents/types";

const GITHUB_TOKEN = process.env.GITHUB_GIST_TOKEN;
const GIST_FILENAME = "projects-list";

// Fallback projects when Gist is not found
export const fallbackProjects: Project[] = [
  {
    id: "bookself",
    title: "Bookself",
    category: "Frontend Arch",
    tagline: "Book collection and management platform",
    description:
      "A modern web application for managing and organizing book collections. Built with focus on clean UI, responsive design, and intuitive user experience.",
    stack: ["React", "Next.js", "TypeScript"],
    complexity: 3,
    size: "medium",
    image: "/project-images/bookself-lg.png",
    imageMobile: "/project-images/bookself-sm.png",
    link: "https://books-collections-five.vercel.app/",
  },
  {
    id: "growth-vector",
    title: "Growth Vector",
    category: "Frontend Arch",
    tagline: "Growth analytics and visualization platform",
    description:
      "An analytics platform designed to track and visualize growth metrics. Features interactive dashboards and data visualization capabilities.",
    stack: ["React", "Next.js", "TypeScript"],
    complexity: 4,
    size: "medium",
    image: "/project-images/growth-vector-lg.png",
    imageMobile: "/project-images/growth-vector-sm.png",
    link: "https://growth-vector.vercel.app/",
  },
  {
    id: "agent-vis",
    title: "Agent Vis",
    category: "AI Engineering",
    tagline: "AI agent visualization and monitoring tool",
    description:
      "A visualization platform for monitoring and understanding AI agent behavior. Provides insights into agent decision-making processes and performance metrics.",
    stack: ["React", "Next.js", "TypeScript", "AI APIs"],
    complexity: 4,
    size: "medium",
    image: "/project-images/agent-vis-lg.png",
    imageMobile: "/project-images/agent-vis-sm.png",
    link: "https://agent-vis.vercel.app/",
  },
];

// Helper function to get authentication header (consistent with contact route)
function getAuthHeader(token: string): string {
  return token.startsWith("ghp_") || token.startsWith("github_pat_")
    ? `Bearer ${token}`
    : `token ${token}`;
}

export async function GET() {
  // If no token, return fallback projects instead of error
  if (!GITHUB_TOKEN) {
    return NextResponse.json({ found: false, data: fallbackProjects });
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
      return NextResponse.json({ found: false, data: fallbackProjects });
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
      return NextResponse.json({ found: false, data: fallbackProjects });
    }

    // Parse the JSON content
    const data = JSON.parse(file.content);
    const projectsArray = Array.isArray(data) ? data : [];

    // If Gist exists but is empty, use fallback
    if (projectsArray.length === 0) {
      return NextResponse.json({ found: false, data: fallbackProjects });
    }

    return NextResponse.json({
      found: true,
      gistId: dbGist.id,
      data: projectsArray,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    // Return fallback projects on error instead of error response
    return NextResponse.json({ found: false, data: fallbackProjects });
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
