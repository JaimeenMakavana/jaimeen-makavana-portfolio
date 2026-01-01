import { NextRequest, NextResponse } from "next/server";
import type { Project } from "@/app/components/ProjectComponents/types";

const GITHUB_TOKEN = process.env.GITHUB_GIST_TOKEN;
const GIST_FILENAME = "projects-list";

// Fallback projects when Gist is not found
export const fallbackProjects: Project[] = [
  {
    id: "keyai-chat",
    title: "Real-Time Chat Module",
    category: "AI Engineering",
    tagline: "Low-latency chat for AI-first communities",
    description:
      "Built a real-time chat system for an AI-driven platform, supporting high-frequency message updates, typing indicators, notifications, and user preferences. Focused on performance, scroll optimization, and scalable state management.",
    stack: ["React", "Next.js", "TypeScript", "WebSockets", "REST APIs"],
    complexity: 5,
    size: "large",
    image: "/projects/keyai-chat.png",
  },
  {
    id: "keyai-community",
    title: "AI-Based Community Creation",
    category: "AI Engineering",
    tagline: "Generate and manage AI-powered communities",
    description:
      "Developed frontend architecture for AI-assisted community creation workflows, integrating backend AI services and dynamic configuration UIs. Emphasis on clean UX for complex, multi-step flows.",
    stack: ["React", "Next.js", "TypeScript", "AI APIs"],
    complexity: 4,
    size: "large",
    image: "/projects/keyai-community.png",
  },
  {
    id: "koffeekodes-accounting",
    title: "Enterprise Accounting Platform",
    category: "System Design",
    tagline: "Accounting workflows built from scratch",
    description:
      "Led frontend foundation for an accounting system handling financial records, reports, and validations. Built form-heavy, state-intensive interfaces with a strong focus on correctness and maintainability.",
    stack: ["React", "TypeScript", "REST APIs"],
    complexity: 5,
    size: "large",
    image: "/projects/accounting.png",
  },
  {
    id: "koffeekodes-transactions",
    title: "Financial Transaction Web App",
    category: "System Design",
    tagline: "Transaction processing for enterprise users",
    description:
      "Built core UI flows for an enterprise financial transaction system, including dashboards, transaction history, and role-based access. Focused on performance and predictable UI behavior.",
    stack: ["React", "TypeScript", "APIs"],
    complexity: 4,
    size: "medium",
    image: "/projects/transactions.png",
  },
  {
    id: "webapster-services",
    title: "Client-Facing Service Applications",
    category: "Frontend Arch",
    tagline: "Reusable UI systems for service projects",
    description:
      "Worked on multiple service-based React applications, building reusable components, improving performance, and delivering production-ready UI for diverse client requirements.",
    stack: ["React", "JavaScript", "CSS"],
    complexity: 3,
    size: "medium",
    image: "/projects/services.png",
  },
  {
    id: "star-interrogator",
    title: "Star Interrogator",
    category: "AI Engineering",
    tagline: "AI-powered image interrogation tool",
    description:
      "Side project using vision-capable LLMs to dynamically question images and extract structured insights. Focused on prompt design, frontend UX, and clear presentation of AI outputs.",
    stack: ["Next.js", "TypeScript", "LLMs", "Vision APIs"],
    complexity: 4,
    size: "medium",
    image: "/projects/star-interrogator.png",
    link: "https://github.com/JaimeenMakavana/star-interrogator",
  },
  {
    id: "project-management-system",
    title: "Project Management System",
    category: "System Design",
    tagline: "Multi-tenant task and analytics platform",
    description:
      "Built a multi-tenant project management system with organization isolation, task boards, and analytics. Focused on scalable frontend architecture and clear data flows.",
    stack: ["React", "Next.js", "TypeScript", "GraphQL"],
    complexity: 5,
    size: "large",
    image: "/projects/pms.png",
    link: "https://github.com/JaimeenMakavana/project-management-system",
  },
  {
    id: "portfolio",
    title: "Personal Portfolio",
    category: "Frontend Arch",
    tagline: "Engineering-focused portfolio site",
    description:
      "Designed and built a personal portfolio to showcase projects, technical depth, and engineering approach. Emphasis on performance, clarity, and maintainable UI.",
    stack: ["Next.js", "TypeScript", "CSS"],
    complexity: 2,
    size: "small",
    image: "/projects/portfolio.png",
    link: "https://jaimeen-makavana-portfolio.vercel.app/",
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
