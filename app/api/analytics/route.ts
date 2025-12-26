import { NextRequest, NextResponse } from "next/server";
import {
  checkTrackingRateLimit,
  checkAdminRateLimit,
  checkGitHubRateLimit,
  getRateLimitHeaders,
} from "../../lib/analytics/rate-limit";

interface VisitorData {
  userId: string; // Unique user identifier
  timestamp: string;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  screenWidth?: number;
  screenHeight?: number;
  timezone?: string;
  language?: string;
  deviceType?: "mobile" | "tablet" | "desktop";
  browser?: string;
  os?: string;
}

interface AnalyticsGist extends VisitorData {
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
async function fetchGists(token: string, perPage = 100): Promise<any[]> {
  const authHeader = getAuthHeader(token);
  const response = await fetch(
    `https://api.github.com/gists?per_page=${perPage}`,
    {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Portfolio-Analytics",
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
): Promise<any | null> {
  try {
    const authHeader = getAuthHeader(token);
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        Authorization: authHeader,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Portfolio-Analytics",
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

// Helper function to parse gist content
async function parseGistContent(
  gist: any,
  token: string
): Promise<VisitorData | null> {
  try {
    // Find the analytics file
    const file = Object.values(gist.files).find((f: any) =>
      f.filename?.startsWith("visitor-analytics-")
    ) as any;

    if (!file || !file.filename) return null;

    // Get full content
    const fileContent = file.content && !file.truncated ? file.content : null;

    const contentText =
      fileContent ||
      (await fetchIndividualGist(gist.id, token))?.files?.[file.filename]
        ?.content;

    if (!contentText) return null;

    // Parse JSON content
    const content = JSON.parse(contentText);
    return content as VisitorData;
  } catch (error) {
    console.error("Error parsing gist content:", error);
    return null;
  }
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";
  return ip;
}

// Helper function to detect device type
function detectDeviceType(userAgent?: string, screenWidth?: number): string {
  if (!userAgent) return "unknown";

  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return "mobile";
  }
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return "tablet";
  }
  if (screenWidth && screenWidth < 768) {
    return "mobile";
  }
  if (screenWidth && screenWidth < 1024) {
    return "tablet";
  }
  return "desktop";
}

// Helper function to extract browser name
function extractBrowser(userAgent?: string): string {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("edg")) return "Edge";
  if (ua.includes("opera") || ua.includes("opr")) return "Opera";
  return "Other";
}

// Helper function to extract OS
function extractOS(userAgent?: string): string {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("mac os")) return "macOS";
  if (ua.includes("linux")) return "Linux";
  if (ua.includes("android")) return "Android";
  if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad"))
    return "iOS";
  return "Other";
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: Check per-IP limit for tracking
    const trackingLimit = checkTrackingRateLimit(request);
    if (!trackingLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Rate limit exceeded. Too many tracking requests. Please try again later.",
          retryAfter: Math.ceil((trackingLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: getRateLimitHeaders(
            100,
            trackingLimit.remaining,
            trackingLimit.resetTime
          ),
        }
      );
    }

    // Rate limiting: Check global GitHub API limit
    const githubLimit = checkGitHubRateLimit();
    if (!githubLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Service temporarily unavailable. GitHub API rate limit reached. Please try again later.",
          retryAfter: Math.ceil((githubLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 503,
          headers: getRateLimitHeaders(
            4500,
            githubLimit.remaining,
            githubLimit.resetTime
          ),
        }
      );
    }

    const body = await request.json();
    const {
      userId,
      userAgent,
      referrer,
      screenWidth,
      screenHeight,
      timezone,
      language,
      timestamp,
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
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

    // Get client IP (anonymized - last octet removed for privacy)
    const clientIP = getClientIP(request);
    const anonymizedIP = clientIP
      .split(".")
      .slice(0, 3)
      .concat(["xxx"])
      .join(".");

    // Prepare visitor data (unique user tracking only)
    const visitorData: VisitorData = {
      userId,
      timestamp: timestamp || new Date().toISOString(),
      ip: anonymizedIP, // Privacy: anonymized IP
      userAgent,
      referrer: referrer || "direct",
      screenWidth,
      screenHeight,
      timezone,
      language,
      deviceType: detectDeviceType(userAgent, screenWidth) as any,
      browser: extractBrowser(userAgent),
      os: extractOS(userAgent),
    };

    // Format the gist content as JSON
    const gistContent = JSON.stringify(visitorData, null, 2);

    // Create filename with timestamp for uniqueness
    const fileTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `visitor-analytics-${fileTimestamp}.json`;

    // Create gist via GitHub API
    const authHeader = getAuthHeader(githubToken);

    const gistResponse = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Portfolio-Analytics",
      },
      body: JSON.stringify({
        description: `Unique Visitor - ${visitorData.deviceType} (${visitorData.browser})`,
        public: false, // Private gist to protect user data
        files: {
          [filename]: {
            content: gistContent,
          },
        },
      }),
    });

    if (!gistResponse.ok) {
      let errorMessage = "Failed to save analytics";
      const errorText = await gistResponse.text();

      try {
        const errorData = JSON.parse(errorText);
        console.error("GitHub API Error:", errorData);

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

    // Include rate limit headers in success response
    const githubLimitAfter = checkGitHubRateLimit();
    const trackingLimitAfter = checkTrackingRateLimit(request);

    return NextResponse.json(
      {
        success: true,
        message: "Analytics recorded successfully",
        gistId: gistData.id,
      },
      {
        status: 200,
        headers: {
          ...getRateLimitHeaders(
            100,
            trackingLimitAfter.remaining,
            trackingLimitAfter.resetTime
          ),
          "X-GitHub-RateLimit-Remaining": String(githubLimitAfter.remaining),
        },
      }
    );
  } catch (error) {
    console.error("Error processing analytics:", error);
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
    // Rate limiting: Check per-IP limit for admin requests
    const adminLimit = checkAdminRateLimit(request);
    if (!adminLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Rate limit exceeded. Too many requests. Please try again later.",
          retryAfter: Math.ceil((adminLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: getRateLimitHeaders(
            300,
            adminLimit.remaining,
            adminLimit.resetTime
          ),
        }
      );
    }

    // Rate limiting: Check global GitHub API limit
    const githubLimit = checkGitHubRateLimit();
    if (!githubLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Service temporarily unavailable. GitHub API rate limit reached. Please try again later.",
          retryAfter: Math.ceil((githubLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 503,
          headers: getRateLimitHeaders(
            4500,
            githubLimit.remaining,
            githubLimit.resetTime
          ),
        }
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const cursor = searchParams.get("cursor") || null; // Gist ID cursor for pagination
    const deviceType = searchParams.get("deviceType") || null;
    const dateFrom = searchParams.get("dateFrom") || null;
    const dateTo = searchParams.get("dateTo") || null;
    const perPage = Math.min(limit, 100); // GitHub API max is 100

    // Fetch gists with pagination support
    // If cursor is provided, we need to fetch from that point
    let allGists: any[] = [];
    let page = 1;
    let hasMorePages = true;
    let foundCursor = !cursor; // If no cursor, start from beginning

    // Fetch multiple pages to support pagination
    while (hasMorePages && page <= 10) {
      // Fetch up to 10 pages (1000 gists max per request)
      const gistsRes = await fetch(
        `https://api.github.com/gists?per_page=100&page=${page}`,
        {
          headers: {
            Authorization: getAuthHeader(githubToken),
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Portfolio-Analytics",
          },
        }
      );

      if (!gistsRes.ok) {
        throw new Error(`GitHub API error: ${gistsRes.status}`);
      }

      const gists = await gistsRes.json();

      // If cursor is provided, find where to start
      if (cursor && !foundCursor) {
        const cursorIndex = gists.findIndex((g: any) => g.id === cursor);
        if (cursorIndex !== -1) {
          // Start from the next item after cursor
          allGists = gists.slice(cursorIndex + 1);
          foundCursor = true;
        } else {
          // Cursor not in this page, continue to next page
          page++;
          if (gists.length < 100) hasMorePages = false;
          continue;
        }
      } else if (foundCursor) {
        // Already found cursor or no cursor, add all gists
        allGists = [...allGists, ...gists];
      }

      // If we got less than 100, we've reached the end
      if (gists.length < 100) {
        hasMorePages = false;
      } else {
        page++;
      }

      // Stop if we have enough data
      if (allGists.length >= limit * 2) {
        hasMorePages = false;
      }
    }

    const gists = allGists;

    // Filter and parse analytics data
    const analyticsGists: AnalyticsGist[] = [];

    // Process gists in parallel for better performance
    const promises = gists
      .filter((gist) => {
        // Check if any file in the gist matches the analytics pattern
        return Object.keys(gist.files || {}).some((filename) =>
          filename.startsWith("visitor-analytics-")
        );
      })
      .map(async (gist) => {
        // Parse the gist content
        const analytics = await parseGistContent(gist, githubToken);
        if (!analytics) return null;

        // Apply filters
        if (deviceType && analytics.deviceType !== deviceType) return null;
        if (dateFrom && new Date(analytics.timestamp) < new Date(dateFrom))
          return null;
        if (dateTo && new Date(analytics.timestamp) > new Date(dateTo))
          return null;

        return {
          ...analytics,
          gistId: gist.id,
          gistUrl: gist.html_url,
          createdAt: gist.created_at,
          updatedAt: gist.updated_at,
        };
      });

    // Wait for all parsing to complete and filter out nulls
    const results = await Promise.all(promises);
    analyticsGists.push(
      ...results.filter((gist): gist is AnalyticsGist => gist !== null)
    );

    // Sort by timestamp (newest first)
    analyticsGists.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply limit and get next cursor
    const limitedGists = analyticsGists.slice(0, limit);
    const nextCursor =
      limitedGists.length === limit && analyticsGists.length > limit
        ? limitedGists[limitedGists.length - 1]?.gistId
        : null;
    const hasMore = nextCursor !== null;

    // Calculate aggregate statistics (unique users only)
    const uniqueUsers = new Set(limitedGists.map((g) => g.userId));

    const stats = {
      totalUniqueUsers: uniqueUsers.size,
      totalRecords: limitedGists.length,
      deviceBreakdown: limitedGists.reduce((acc, g) => {
        acc[g.deviceType || "unknown"] =
          (acc[g.deviceType || "unknown"] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      browserBreakdown: limitedGists.reduce((acc, g) => {
        acc[g.browser || "unknown"] = (acc[g.browser || "unknown"] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      osBreakdown: limitedGists.reduce((acc, g) => {
        acc[g.os || "unknown"] = (acc[g.os || "unknown"] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // Check limits after processing
    const githubLimitAfter = checkGitHubRateLimit();
    const adminLimitAfter = checkAdminRateLimit(request);

    return NextResponse.json(
      {
        success: true,
        count: limitedGists.length,
        total: analyticsGists.length,
        hasMore,
        nextCursor,
        stats,
        visitors: limitedGists,
      },
      {
        status: 200,
        headers: {
          ...getRateLimitHeaders(
            300,
            adminLimitAfter.remaining,
            adminLimitAfter.resetTime
          ),
          "X-GitHub-RateLimit-Remaining": String(githubLimitAfter.remaining),
        },
      }
    );
  } catch (error) {
    console.error("Error fetching analytics:", error);

    let errorMessage = "Failed to fetch analytics";
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
