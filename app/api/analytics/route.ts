import { NextRequest, NextResponse } from "next/server";
import {
  checkTrackingRateLimit,
  checkAdminRateLimit,
  getRateLimitHeaders,
} from "../../lib/analytics/rate-limit";
import {
  createAnalyticsEvent,
  getAnalyticsData,
} from "@/app/lib/analytics/repository";

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";
  return ip;
}

function detectDeviceType(
  userAgent?: string,
  screenWidth?: number
): "mobile" | "tablet" | "desktop" | undefined {
  if (!userAgent) return undefined;

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

function extractBrowser(userAgent?: string): string | undefined {
  if (!userAgent) return undefined;
  const ua = userAgent.toLowerCase();
  if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("edg")) return "Edge";
  if (ua.includes("opera") || ua.includes("opr")) return "Opera";
  return "Other";
}

function extractOS(userAgent?: string): string | undefined {
  if (!userAgent) return undefined;
  const ua = userAgent.toLowerCase();
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("mac os")) return "macOS";
  if (ua.includes("linux")) return "Linux";
  if (ua.includes("android")) return "Android";
  if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) {
    return "iOS";
  }
  return "Other";
}

export async function POST(request: NextRequest) {
  try {
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
    } = body as Record<string, unknown>;

    if (typeof userId !== "string" || userId.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 }
      );
    }

    const clientIP = getClientIP(request);
    const anonymizedIP = clientIP
      .split(".")
      .slice(0, 3)
      .concat(["xxx"])
      .join(".");

    const event = await createAnalyticsEvent({
      userId: userId.trim(),
      timestamp:
        typeof timestamp === "string" && timestamp.length > 0
          ? timestamp
          : new Date().toISOString(),
      ip: anonymizedIP,
      userAgent: typeof userAgent === "string" ? userAgent : undefined,
      referrer: typeof referrer === "string" ? referrer : "direct",
      screenWidth: typeof screenWidth === "number" ? screenWidth : undefined,
      screenHeight:
        typeof screenHeight === "number" ? screenHeight : undefined,
      timezone: typeof timezone === "string" ? timezone : undefined,
      language: typeof language === "string" ? language : undefined,
      deviceType: detectDeviceType(
        typeof userAgent === "string" ? userAgent : undefined,
        typeof screenWidth === "number" ? screenWidth : undefined
      ),
      browser: extractBrowser(
        typeof userAgent === "string" ? userAgent : undefined
      ),
      os: extractOS(typeof userAgent === "string" ? userAgent : undefined),
    });

    const trackingLimitAfter = checkTrackingRateLimit(request);

    return NextResponse.json(
      {
        success: true,
        message: "Analytics recorded successfully",
        eventId: event.eventId,
      },
      {
        status: 200,
        headers: getRateLimitHeaders(
          100,
          trackingLimitAfter.remaining,
          trackingLimitAfter.resetTime
        ),
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

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "50", 10) || 50, 1),
      100
    );
    const cursor = searchParams.get("cursor");
    const deviceType = searchParams.get("deviceType");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const data = await getAnalyticsData({
      limit,
      cursor,
      deviceType,
      dateFrom,
      dateTo,
    });

    const adminLimitAfter = checkAdminRateLimit(request);

    return NextResponse.json(
      {
        success: true,
        count: data.visitors.length,
        total: data.total,
        hasMore: data.hasMore,
        nextCursor: data.nextCursor,
        stats: data.stats,
        visitors: data.visitors,
      },
      {
        status: 200,
        headers: getRateLimitHeaders(
          300,
          adminLimitAfter.remaining,
          adminLimitAfter.resetTime
        ),
      }
    );
  } catch (error) {
    console.error("Error fetching analytics:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch analytics";

    return NextResponse.json(
      {
        error: `An unexpected error occurred: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
