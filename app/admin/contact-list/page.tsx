"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCcw,
  ExternalLink,
  Mail,
  Terminal,
  Filter,
  Github,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES ---
// Matches the "ContactGist" interface from your API
interface ContactSubmission {
  name: string;
  email: string;
  message: string;
  intent: string;
  timestamp: string;
  gistId: string;
  gistUrl: string;
}

interface ApiResponse {
  success: boolean;
  count: number;
  total: number;
  gists: ContactSubmission[];
  error?: string;
}

// --- UTILS ---
const formatDate = (isoString: string) => {
  try {
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch (e) {
    return "Unknown Date";
  }
};

const getIntentBadgeStyle = (intent: string) => {
  const normalized = intent.toLowerCase();
  switch (normalized) {
    case "project":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "hiring":
      return "bg-[#e4e987] text-black border-[#d4d977] font-bold";
    case "consulting":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

export default function AdminContactList() {
  const [data, setData] = useState<ContactSubmission[]>([]);
  const [filteredData, setFilteredData] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIntent, setSelectedIntent] = useState<string>("ALL");

  // --- DATA FETCHING ---
  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calls your new Next.js API route
      const response = await fetch("/api/contact?limit=100");
      const json: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Failed to fetch data stream");
      }

      if (json.success) {
        setData(json.gists);
        setFilteredData(json.gists);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // --- FILTERING LOGIC ---
  useEffect(() => {
    let result = data;

    // 1. Filter by Intent Tab
    if (selectedIntent !== "ALL") {
      result = result.filter(
        (item) => item.intent.toLowerCase() === selectedIntent.toLowerCase()
      );
    }

    // 2. Filter by Search Query
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
    <div className="min-h-screen bg-[#fafafa] p-6 md:py-12 md:px-28 font-sans text-neutral-800">
      {/* 1. HEADER */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#e4e987] animate-pulse"></span>
            <h5 className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
              Gist Database / Live Feed
            </h5>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
            Incoming <span className="text-(--bg-accent-glow)">Signals</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSubmissions}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-[#e4e987] hover:text-black transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
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

      {/* 2. CONTROL PANEL */}
      <div className="max-w-7xl mx-auto mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-black transition-colors" />
            <input
              type="text"
              placeholder="Search source by name, email, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-xl outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm"
            />
          </div>

          {/* Intent Tabs */}
          <div className="flex p-1 bg-white border border-neutral-200 rounded-xl overflow-x-auto">
            {["ALL", "PROJECT", "HIRING", "CONSULTING", "HI"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedIntent(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all whitespace-nowrap ${
                  selectedIntent === tab
                    ? "bg-black text-[#e4e987]"
                    : "text-neutral-500 hover:bg-neutral-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. DATA TABLE */}
      <div className="max-w-7xl mx-auto bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm min-h-[400px]">
        {/* Loading */}
        {loading && (
          <div className="h-96 flex flex-col items-center justify-center text-neutral-400 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-neutral-100 border-t-black rounded-full animate-spin"></div>
            </div>
            <p className="font-mono text-xs uppercase tracking-widest">
              Fetching Gist Packets...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="h-96 flex flex-col items-center justify-center text-red-500 space-y-4 p-8 text-center">
            <Terminal className="w-10 h-10" />
            <h3 className="text-lg font-bold">Connection Failed</h3>
            <p className="font-mono text-sm bg-red-50 p-4 rounded border border-red-100">
              {error}
            </p>
            <p className="text-xs text-neutral-400">
              Check your GITHUB_GIST_TOKEN and environment variables.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredData.length === 0 && (
          <div className="h-96 flex flex-col items-center justify-center text-neutral-400">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
              <Filter className="w-8 h-8 opacity-20" />
            </div>
            <p>No transmissions found matching parameters.</p>
          </div>
        )}

        {/* Table Content */}
        {!loading && !error && filteredData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100 text-[10px] md:text-xs font-mono uppercase text-neutral-500 tracking-wider">
                  <th className="p-4 pl-6 font-medium">Source Identity</th>
                  <th className="p-4 font-medium">Signal Type</th>
                  <th className="p-4 font-medium">Payload Content</th>
                  <th className="p-4 font-medium">Timestamp</th>
                  <th className="p-4 pr-6 font-medium text-right">Raw Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <AnimatePresence>
                  {filteredData.map((item) => (
                    <motion.tr
                      key={item.gistId}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group hover:bg-neutral-50 transition-colors"
                    >
                      <td className="p-4 pl-6 align-top">
                        <div className="font-bold text-neutral-900 text-sm">
                          {item.name}
                        </div>
                        <a
                          href={`mailto:${item.email}`}
                          className="text-xs text-neutral-500 font-mono flex items-center gap-1 mt-1 hover:text-black transition-colors"
                        >
                          <Mail className="w-3 h-3" />
                          {item.email}
                        </a>
                      </td>
                      <td className="p-4 align-top">
                        <span
                          className={`inline-block px-2 py-1 rounded border text-[10px] uppercase tracking-wide ${getIntentBadgeStyle(
                            item.intent
                          )}`}
                        >
                          {item.intent}
                        </span>
                      </td>
                      <td className="p-4 max-w-md align-top">
                        <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
                          {item.message}
                        </p>
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.timestamp)}
                        </div>
                      </td>
                      <td className="p-4 pr-6 align-top text-right">
                        <a
                          href={item.gistUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-white border border-neutral-200 text-neutral-400 hover:text-black hover:border-black transition-all"
                          title="View Raw Gist"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="max-w-7xl mx-auto mt-4 flex justify-between items-center text-[10px] text-neutral-400 font-mono uppercase">
        <span>
          Displaying {filteredData.length} of {data.length} records
        </span>
        <span>Secure Connection • Gist Storage</span>
      </div>
    </div>
  );
}
