"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  RefreshCcw,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  TrendingUp,
  MapPin,
  Calendar,
  Filter,
  Download,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES ---
interface VisitorData {
  userId: string;
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
  gistId: string;
  gistUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface AnalyticsResponse {
  success: boolean;
  count: number;
  total: number;
  hasMore?: boolean;
  nextCursor?: string | null;
  stats: {
    totalUniqueUsers: number;
    totalRecords: number;
    deviceBreakdown: Record<string, number>;
    browserBreakdown: Record<string, number>;
    osBreakdown: Record<string, number>;
  };
  visitors: VisitorData[];
  error?: string;
}

// --- UTILS ---
const formatDate = (isoString: string) => {
  try {
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch (e) {
    return "Unknown Date";
  }
};

const getDeviceIcon = (deviceType?: string) => {
  switch (deviceType) {
    case "mobile":
      return Smartphone;
    case "tablet":
      return Tablet;
    case "desktop":
      return Monitor;
    default:
      return Monitor;
  }
};

const getDeviceColor = (deviceType?: string) => {
  switch (deviceType) {
    case "mobile":
      return "var(--bg-accent-glow)";
    case "tablet":
      return "var(--muted)";
    case "desktop":
      return "var(--text-display)";
    default:
      return "var(--text-muted)";
  }
};

export default function AdminAnalytics() {
  const [visitors, setVisitors] = useState<VisitorData[]>([]);
  const [stats, setStats] = useState<AnalyticsResponse["stats"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string>("ALL");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // --- DATA FETCHING ---
  const fetchAnalytics = async (
    cursor: string | null = null,
    append = false
  ) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const url = cursor
        ? `/api/analytics?limit=50&cursor=${cursor}`
        : "/api/analytics?limit=50";
      const response = await fetch(url);
      const json: AnalyticsResponse = await response.json();

      if (!response.ok) {
        // Handle rate limit errors
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          throw new Error(
            `Rate limit exceeded. Please wait ${retryAfter}s before trying again.`
          );
        } else if (response.status === 503) {
          throw new Error(
            "Service temporarily unavailable. GitHub API rate limit reached."
          );
        }
        throw new Error(json.error || "Failed to fetch analytics");
      }

      if (json.success) {
        if (append) {
          // Append new visitors
          setVisitors((prev) => [...prev, ...json.visitors]);
        } else {
          // Replace all data
          setVisitors(json.visitors);
        }
        setStats(json.stats);
        setNextCursor(json.nextCursor || null);
        setHasMore(json.hasMore || false);
        setTotal(json.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more data
  const loadMore = () => {
    if (!loadingMore && hasMore && nextCursor) {
      fetchAnalytics(nextCursor, true);
    }
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loadingMore, nextCursor]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Filter visitors
  const filteredVisitors = visitors.filter((visitor) => {
    if (selectedDevice !== "ALL" && visitor.deviceType !== selectedDevice)
      return false;
    return true;
  });

  // Get unique device types
  const deviceTypes = Array.from(
    new Set(visitors.map((v) => v.deviceType || "unknown"))
  )
    .filter((d) => d !== "unknown")
    .sort();

  return (
    <div
      className="min-h-screen p-6 md:py-12 md:px-28 font-sans"
      style={{
        backgroundColor: "var(--bg-canvas)",
        color: "var(--text-body)",
      }}
    >
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--bg-accent-glow)" }}
            ></span>
            <h5
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Analytics Dashboard / Live Metrics
            </h5>
          </div>
          <h1
            className="text-4xl md:text-5xl font-black tracking-tighter uppercase"
            style={{ color: "var(--text-display)" }}
          >
            Unique{" "}
            <span style={{ color: "var(--bg-accent-glow)" }}>Visitors</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAnalytics(null, false)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
            style={{
              backgroundColor: "var(--nav-surface)",
              color: "var(--nav-text-idle)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "var(--bg-accent-glow)";
                e.currentTarget.style.color = "var(--text-display)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "var(--nav-surface)";
                e.currentTarget.style.color = "var(--nav-text-idle)";
              }
            }}
          >
            <RefreshCcw
              className={`w-4 h-4 ${
                loading
                  ? "animate-spin"
                  : "group-hover:rotate-180 transition-transform"
              }`}
            />
            <span className="font-mono text-sm uppercase tracking-wide">
              Refresh
            </span>
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      {stats && (
        <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Visits */}
          <div
            className="p-6 rounded-2xl border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <Users
                className="w-5 h-5"
                style={{ color: "var(--text-muted)" }}
              />
              <TrendingUp
                className="w-4 h-4"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
            <div
              className="text-3xl font-black mb-1"
              style={{ color: "var(--text-display)" }}
            >
              {stats.totalUniqueUsers}
            </div>
            <div
              className="text-xs font-mono uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Unique Users
            </div>
          </div>

          {/* Unique Sessions */}
          <div
            className="p-6 rounded-2xl border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <Globe
                className="w-5 h-5"
                style={{ color: "var(--text-muted)" }}
              />
              <BarChart3
                className="w-4 h-4"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
            <div
              className="text-3xl font-black mb-1"
              style={{ color: "var(--text-display)" }}
            >
              {stats.totalRecords}
            </div>
            <div
              className="text-xs font-mono uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Total Records
            </div>
          </div>

          {/* Avg Duration */}
          <div
            className="p-6 rounded-2xl border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <Clock
                className="w-5 h-5"
                style={{ color: "var(--text-muted)" }}
              />
              <TrendingUp
                className="w-4 h-4"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
          </div>

          {/* Device Breakdown */}
          <div
            className="p-6 rounded-2xl border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <Monitor
                className="w-5 h-5"
                style={{ color: "var(--text-muted)" }}
              />
              <BarChart3
                className="w-4 h-4"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
            <div className="space-y-2">
              {Object.entries(stats.deviceBreakdown).map(([device, count]) => {
                const DeviceIcon = getDeviceIcon(device);
                return (
                  <div
                    key={device}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <DeviceIcon
                        className="w-3 h-3"
                        style={{ color: getDeviceColor(device) }}
                      />
                      <span
                        className="text-xs font-mono uppercase"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {device}
                      </span>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: "var(--text-display)" }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="max-w-7xl mx-auto mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Device Filter */}
          <div
            className="flex p-1 rounded-xl overflow-x-auto border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            {["ALL", ...deviceTypes].map((device) => (
              <button
                key={device}
                onClick={() => setSelectedDevice(device)}
                className="px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all whitespace-nowrap"
                style={{
                  backgroundColor:
                    selectedDevice === device
                      ? "var(--nav-surface)"
                      : "transparent",
                  color:
                    selectedDevice === device
                      ? "var(--bg-accent-glow)"
                      : "var(--text-muted)",
                }}
              >
                {device}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VISITORS TABLE */}
      <div
        className="max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-sm min-h-[400px] border"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        {/* Loading */}
        {loading && (
          <div
            className="h-96 flex flex-col items-center justify-center space-y-4"
            style={{ color: "var(--text-muted)" }}
          >
            <div className="relative">
              <div
                className="w-12 h-12 border-4 rounded-full animate-spin"
                style={{
                  borderColor: "var(--muted)",
                  borderTopColor: "var(--text-display)",
                }}
              ></div>
            </div>
            <p className="font-mono text-xs uppercase tracking-widest">
              Loading Analytics...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className="h-96 flex flex-col items-center justify-center space-y-4 p-8 text-center"
            style={{ color: "var(--destructive)" }}
          >
            <Filter className="w-10 h-10" />
            <h3 className="text-lg font-bold">Connection Failed</h3>
            <p
              className="font-mono text-sm p-4 rounded border"
              style={{
                backgroundColor: "var(--destructive)",
                opacity: 0.1,
                borderColor: "var(--destructive)",
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredVisitors.length === 0 && (
          <div
            className="h-96 flex flex-col items-center justify-center"
            style={{ color: "var(--text-muted)" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "var(--muted)" }}
            >
              <Users className="w-8 h-8 opacity-20" />
            </div>
            <p>No visitor data found.</p>
          </div>
        )}

        {/* Table Content */}
        {!loading && !error && filteredVisitors.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className="border-b text-[10px] md:text-xs font-mono uppercase tracking-wider"
                  style={{
                    backgroundColor: "var(--muted)",
                    borderColor: "var(--border)",
                    color: "var(--text-muted)",
                  }}
                >
                  <th className="p-4 pl-6 font-medium">User ID</th>
                  <th className="p-4 font-medium">Device</th>
                  <th className="p-4 font-medium">Browser / OS</th>
                  <th className="p-4 font-medium">Referrer</th>
                  <th className="p-4 font-medium">Timestamp</th>
                  <th className="p-4 pr-6 font-medium text-right">Location</th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: "var(--border)" }}
              >
                <AnimatePresence>
                  {filteredVisitors.map((visitor) => {
                    const DeviceIcon = getDeviceIcon(visitor.deviceType);
                    return (
                      <motion.tr
                        key={visitor.gistId}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group transition-colors"
                        style={{
                          borderColor: "var(--border)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--muted)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <td className="p-4 pl-6 align-top">
                          <span
                            className="text-xs font-mono"
                            style={{ color: "var(--text-body)" }}
                          >
                            {visitor.userId
                              ? `${visitor.userId.substring(0, 20)}...`
                              : "Unknown"}
                          </span>
                        </td>
                        <td className="p-4 align-top">
                          <div className="flex items-center gap-2">
                            <DeviceIcon
                              className="w-4 h-4"
                              style={{
                                color: getDeviceColor(visitor.deviceType),
                              }}
                            />
                            <span
                              className="text-xs font-mono uppercase"
                              style={{ color: "var(--text-display)" }}
                            >
                              {visitor.deviceType || "unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="space-y-1">
                            <div
                              className="text-xs font-mono"
                              style={{ color: "var(--text-body)" }}
                            >
                              {visitor.browser || "Unknown"}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {visitor.os || "Unknown"}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <span
                            className="text-xs font-mono"
                            style={{ color: "var(--text-body)" }}
                          >
                            {visitor.referrer === "direct" ? (
                              <span style={{ color: "var(--text-muted)" }}>
                                Direct
                              </span>
                            ) : (
                              <a
                                href={visitor.referrer}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                                style={{ color: "var(--bg-accent-glow)" }}
                              >
                                {new URL(visitor.referrer || "").hostname}
                              </a>
                            )}
                          </span>
                        </td>
                        <td className="p-4 align-top">
                          <div
                            className="flex items-center gap-1.5 text-xs font-mono"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <Calendar className="w-3 h-3" />
                            {formatDate(visitor.timestamp)}
                          </div>
                        </td>
                        <td className="p-4 pr-6 align-top text-right">
                          <div
                            className="flex items-center justify-end gap-1.5 text-xs font-mono"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <MapPin className="w-3 h-3" />
                            {visitor.timezone || "Unknown"}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {hasMore && (
          <div
            ref={loadMoreRef}
            className="h-20 flex items-center justify-center"
            style={{ color: "var(--text-muted)" }}
          >
            {loadingMore && (
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 border-2 rounded-full animate-spin"
                  style={{
                    borderColor: "var(--muted)",
                    borderTopColor: "var(--text-display)",
                  }}
                ></div>
                <span className="font-mono text-xs uppercase tracking-wider">
                  Loading more...
                </span>
              </div>
            )}
          </div>
        )}

        {/* End of List */}
        {!hasMore && filteredVisitors.length > 0 && (
          <div
            className="h-20 flex items-center justify-center"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="font-mono text-xs uppercase tracking-wider">
              All records loaded
            </span>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div
        className="max-w-7xl mx-auto mt-4 flex justify-between items-center text-[10px] font-mono uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        <span>
          Displaying {filteredVisitors.length} of {total} records
          {hasMore && " (more available)"}
        </span>
        <span>Secure Connection • Gist Storage</span>
      </div>
    </div>
  );
}
