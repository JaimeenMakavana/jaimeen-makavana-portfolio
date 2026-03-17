"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  RefreshCcw,
  Mail,
  Terminal,
  Filter,
  Calendar,
  Database,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ContactSubmission {
  submissionId: string;
  name: string;
  email: string;
  message: string;
  intent: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  count: number;
  total: number;
  submissions: ContactSubmission[];
  error?: string;
}

const formatDate = (isoString: string) => {
  try {
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "Unknown Date";
  }
};

const getIntentBadgeStyle = (intent: string) => {
  const normalized = intent.toLowerCase();
  switch (normalized) {
    case "project":
      return {
        backgroundColor: "var(--muted)",
        color: "var(--text-body)",
        borderColor: "var(--border)",
      };
    case "hiring":
      return {
        backgroundColor: "var(--bg-accent-glow)",
        color: "var(--text-display)",
        borderColor: "var(--bg-accent-glow)",
      };
    case "consulting":
      return {
        backgroundColor: "var(--muted)",
        color: "var(--text-body)",
        borderColor: "var(--border)",
      };
    default:
      return {
        backgroundColor: "var(--muted)",
        color: "var(--text-muted)",
        borderColor: "var(--border)",
      };
  }
};

export default function AdminContactList() {
  const [data, setData] = useState<ContactSubmission[]>([]);
  const [filteredData, setFilteredData] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIntent, setSelectedIntent] = useState<string>("ALL");

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/contact?limit=100");
      const json: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Failed to fetch data stream");
      }

      if (json.success) {
        setData(json.submissions);
        setFilteredData(json.submissions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSubmissions();
  }, []);

  useEffect(() => {
    let result = data;

    if (selectedIntent !== "ALL") {
      result = result.filter(
        (item) => item.intent.toLowerCase() === selectedIntent.toLowerCase()
      );
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerQuery) ||
          item.email.toLowerCase().includes(lowerQuery) ||
          item.message.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredData(result);
  }, [data, selectedIntent, searchQuery]);

  return (
    <div
      className="min-h-screen p-6 md:py-12 md:px-28 font-sans"
      style={{
        backgroundColor: "var(--bg-canvas)",
        color: "var(--text-body)",
      }}
    >
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
              Neon Database / Live Feed
            </h5>
          </div>
          <h1
            className="text-4xl md:text-5xl font-black tracking-tighter uppercase"
            style={{ color: "var(--text-display)" }}
          >
            Incoming{" "}
            <span style={{ color: "var(--bg-accent-glow)" }}>Signals</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSubmissions}
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
              Sync Data
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search source by name, email, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-1 transition-all shadow-sm"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                borderWidth: "1px",
                borderStyle: "solid",
                color: "var(--text-body)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--text-display)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            />
          </div>

          <div
            className="flex p-1 rounded-xl overflow-x-auto border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            {["ALL", "PROJECT", "HIRING", "CONSULTING", "HI"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedIntent(tab)}
                className="px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all whitespace-nowrap"
                style={{
                  backgroundColor:
                    selectedIntent === tab
                      ? "var(--nav-surface)"
                      : "transparent",
                  color:
                    selectedIntent === tab
                      ? "var(--bg-accent-glow)"
                      : "var(--text-muted)",
                }}
                onMouseEnter={(e) => {
                  if (selectedIntent !== tab) {
                    e.currentTarget.style.backgroundColor = "var(--muted)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedIntent !== tab) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-sm min-h-[400px] border"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
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
              Fetching Neon Records...
            </p>
          </div>
        )}

        {!loading && error && (
          <div
            className="h-96 flex flex-col items-center justify-center space-y-4 p-8 text-center"
            style={{ color: "var(--destructive)" }}
          >
            <Terminal className="w-10 h-10" />
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
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Check your Neon env variables and database connection.
            </p>
          </div>
        )}

        {!loading && !error && filteredData.length === 0 && (
          <div
            className="h-96 flex flex-col items-center justify-center"
            style={{ color: "var(--text-muted)" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "var(--muted)" }}
            >
              <Filter className="w-8 h-8 opacity-20" />
            </div>
            <p>No transmissions found matching parameters.</p>
          </div>
        )}

        {!loading && !error && filteredData.length > 0 && (
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
                  <th className="p-4 pl-6 font-medium">Source Identity</th>
                  <th className="p-4 font-medium">Signal Type</th>
                  <th className="p-4 font-medium">Payload Content</th>
                  <th className="p-4 font-medium">Timestamp</th>
                  <th className="p-4 pr-6 font-medium text-right">Record</th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: "var(--border)" }}
              >
                <AnimatePresence>
                  {filteredData.map((item) => {
                    const badgeStyle = getIntentBadgeStyle(item.intent);
                    return (
                      <motion.tr
                        key={item.submissionId}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group transition-colors"
                        style={{ borderColor: "var(--border)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--muted)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <td className="p-4 pl-6 align-top">
                          <div
                            className="font-bold text-sm"
                            style={{ color: "var(--text-display)" }}
                          >
                            {item.name}
                          </div>
                          <a
                            href={`mailto:${item.email}`}
                            className="text-xs font-mono flex items-center gap-1 mt-1 transition-colors"
                            style={{ color: "var(--text-muted)" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color =
                                "var(--text-display)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "var(--text-muted)";
                            }}
                          >
                            <Mail className="w-3 h-3" />
                            {item.email}
                          </a>
                        </td>
                        <td className="p-4 align-top">
                          <span
                            className="inline-block px-2 py-1 rounded border text-[10px] uppercase tracking-wide"
                            style={badgeStyle}
                          >
                            {item.intent}
                          </span>
                        </td>
                        <td className="p-4 max-w-md align-top">
                          <p
                            className="text-sm leading-relaxed whitespace-pre-wrap"
                            style={{ color: "var(--text-body)" }}
                          >
                            {item.message}
                          </p>
                        </td>
                        <td className="p-4 align-top">
                          <div
                            className="flex items-center gap-1.5 text-xs font-mono"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.timestamp)}
                          </div>
                        </td>
                        <td className="p-4 pr-6 align-top text-right">
                          <div
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-mono uppercase"
                            style={{
                              backgroundColor: "var(--card)",
                              borderColor: "var(--border)",
                              color: "var(--text-muted)",
                            }}
                          >
                            <Database className="w-4 h-4" />
                            {item.submissionId.slice(0, 8)}
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
      </div>

      <div
        className="max-w-7xl mx-auto mt-4 flex justify-between items-center text-[10px] font-mono uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        <span>
          Displaying {filteredData.length} of {data.length} records
        </span>
        <span>Secure Connection | Neon Storage</span>
      </div>
    </div>
  );
}
