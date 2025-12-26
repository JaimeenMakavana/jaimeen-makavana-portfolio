"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  User,
  LogOut,
  Terminal,
  Settings,
  BarChart3,
  Home,
} from "lucide-react";
import { motion } from "framer-motion";
import { logoutAction } from "@/app/actions/auth";

// --- CONFIGURATION ---
const NAV_ITEMS = [
  {
    label: "Command Center",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Signals / Inbox",
    href: "/admin/contact-list",
    icon: MessageSquare,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Project CMS",
    href: "/admin/projects-handling",
    icon: FolderKanban,
  },
  {
    label: "Career / Bio",
    href: "/admin/about-handling",
    icon: User,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-black text-white border-r border-neutral-800 z-50">
        {/* Logo / Header */}
        <div className="p-6 border-b border-neutral-900">
          <div className="flex items-center gap-3 text-[#e4e987]">
            <Terminal className="w-6 h-6" />
            <span className="font-mono font-bold tracking-widest uppercase">
              SYS.ADMIN
            </span>
          </div>
          <div className="mt-2 text-[10px] text-neutral-500 font-mono">
            v2.0.4 • SECURE CONNECTION
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? "bg-neutral-900 text-[#e4e987]"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-neutral-900 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <item.icon
                    className={`w-5 h-5 ${isActive ? "text-[#e4e987]" : ""}`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "font-bold" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Actions */}
        <div className="p-4 border-t border-neutral-900 space-y-2">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:bg-neutral-900/50 hover:text-white rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">View Portfolio</span>
          </Link>
          <button
            onClick={() => logoutAction()}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Exit System</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE HEADER (Top Bar) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-md z-50 flex items-center justify-between px-6 border-b border-white/10">
        <div className="flex items-center gap-2 text-[#e4e987]">
          <Terminal className="w-5 h-5" />
          <span className="font-mono font-bold tracking-widest text-sm">
            ADMIN
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            title="View Portfolio"
          >
            <Home className="w-5 h-5 text-neutral-400" />
          </Link>
          <button
            onClick={() => logoutAction()}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* 3. MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 px-6 pb-6 pt-4 safe-area-bottom">
        <div className="flex justify-between items-center">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`p-2 rounded-full transition-colors ${
                    isActive ? "bg-[#e4e987] text-black" : "text-neutral-500"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                {isActive && (
                  <span className="text-[10px] font-bold text-[#e4e987] font-mono">
                    •
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 4. MAIN CONTENT WRAPPER */}
      <main className="md:pl-64 min-h-screen pt-16 md:pt-0 pb-24 md:pb-0 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
