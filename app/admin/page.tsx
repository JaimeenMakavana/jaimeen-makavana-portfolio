"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutTemplate,
  MessageSquare,
  Activity,
  ArrowUpRight,
  Clock,
  Database,
  ShieldCheck,
  Cpu,
  GitBranch,
  User, // Imported User icon for the About module
} from "lucide-react";

// --- COMPONENTS ---

const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  delay = 0,
}: {
  label: string;
  value: string;
  icon: any;
  trend?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-6 rounded-2xl border border-neutral-200 flex flex-col justify-between h-32 hover:border-black/20 transition-colors"
  >
    <div className="flex justify-between items-start">
      <div className="p-2 bg-neutral-50 rounded-lg">
        <Icon className="w-5 h-5 text-neutral-600" />
      </div>
      {trend && (
        <span className="text-[10px] font-mono bg-[#e4e987] text-black px-1.5 py-0.5 rounded flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" /> {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
      <p className="text-xs font-mono uppercase text-neutral-400 mt-1">
        {label}
      </p>
    </div>
  </motion.div>
);

const NavCard = ({
  title,
  desc,
  href,
  icon: Icon,
  colorClass,
  delay = 0,
}: {
  title: string;
  desc: string;
  href: string;
  icon: any;
  colorClass: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="h-full"
  >
    <Link
      href={href}
      className="group relative block h-full bg-white p-8 rounded-3xl border border-neutral-200 overflow-hidden hover:border-black transition-all duration-300"
    >
      <div
        className={`absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${colorClass}`}
      >
        <Icon className="w-32 h-32 transform rotate-12 group-hover:rotate-0 transition-transform duration-500" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`p-3 rounded-xl bg-neutral-50 group-hover:bg-black group-hover:text-[#e4e987] transition-colors duration-300`}
            >
              <Icon className="w-6 h-6" />
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              Module
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 group-hover:translate-x-1 transition-transform">
            {title}
          </h2>
          <p className="text-neutral-500 text-sm md:text-base max-w-sm group-hover:text-black transition-colors">
            {desc}
          </p>
        </div>

        <div className="mt-8 flex items-center gap-2 text-sm font-bold opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <span>ACCESS TERMINAL</span>
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  </motion.div>
);

const SystemLog = () => (
  <div className="bg-black text-neutral-400 p-6 rounded-3xl font-mono text-xs h-full flex flex-col overflow-hidden">
    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
      <span className="text-[#e4e987]">SYSTEM_LOG.txt</span>
      <div className="flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-red-500/50" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
        <div className="w-2 h-2 rounded-full bg-green-500" />
      </div>
    </div>
    <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1">
      <div className="flex gap-3">
        <span className="text-neutral-600">[10:42:01]</span>
        <span>
          <span className="text-blue-400">INFO</span> Connection established
          with Gist API
        </span>
      </div>
      <div className="flex gap-3">
        <span className="text-neutral-600">[10:42:05]</span>
        <span>
          <span className="text-green-400">SUCCESS</span> Project database
          synchronized
        </span>
      </div>
      <div className="flex gap-3">
        <span className="text-neutral-600">[10:45:12]</span>
        <span>
          <span className="text-yellow-400">WARN</span> 3 unread messages in
          queue
        </span>
      </div>
      <div className="flex gap-3">
        <span className="text-neutral-600">[10:50:00]</span>
        <span>
          <span className="text-blue-400">INFO</span> Garbage collection started
        </span>
      </div>
      <div className="flex gap-3 opacity-50">
        <span className="text-neutral-600">[11:00:00]</span>
        <span className="animate-pulse">_Waiting for input...</span>
      </div>
    </div>
  </div>
);

// --- MAIN PAGE ---

export default function AdminDashboard() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 md:px-28 text-neutral-900">
      {/* 1. HEADER */}
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h5 className="font-mono text-xs text-neutral-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Online
          </h5>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase">
            Command <span className="text-(--bg-accent-glow)">Center</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <div className="text-xs font-mono text-neutral-400 uppercase">
              Local Time
            </div>
            <div className="text-2xl font-bold font-mono flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#e4e987]" />
              {time}
            </div>
          </div>
          <div className="w-px h-10 bg-neutral-200 hidden md:block" />
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase">
                Auth Status
              </span>
              <span className="text-[10px] text-neutral-500">
                Admin Privileges
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. STATS ROW */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          label="Total Projects"
          value="12"
          icon={Database}
          trend="+2 this week"
          delay={0.1}
        />
        <StatCard
          label="Messages"
          value="84"
          icon={MessageSquare}
          trend="New Signal"
          delay={0.2}
        />
        <StatCard
          label="Gist Requests"
          value="1.2k"
          icon={GitBranch}
          delay={0.3}
        />
        <StatCard
          label="System Health"
          value="100%"
          icon={Activity}
          delay={0.4}
        />
      </div>

      {/* 3. MAIN BENTO GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 md:h-[600px]">
        {/* Navigation: Contact List (Top Row, 2 cols) */}
        <div className="md:col-span-2 md:row-span-1">
          <NavCard
            title="Incoming Signals"
            desc="Review contact form submissions, filter by intent, and access raw Gist data."
            href="/admin/contact-list"
            icon={MessageSquare}
            colorClass="text-blue-500"
            delay={0.5}
          />
        </div>

        {/* System Log (Spans 2 rows on the right) */}
        <div className="md:col-span-1 md:row-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="h-full"
          >
            <SystemLog />
          </motion.div>
        </div>

        {/* Navigation: Projects (Bottom Row, 1 col) */}
        <div className="md:col-span-1 md:row-span-1">
          <NavCard
            title="Project CMS"
            desc="CRUD operations. Edit stacks & complexity scores."
            href="/admin/project-handling"
            icon={LayoutTemplate}
            colorClass="text-[#e4e987]"
            delay={0.6}
          />
        </div>

        {/* Navigation: About (Bottom Row, 1 col) */}
        <div className="md:col-span-1 md:row-span-1">
          <NavCard
            title="Career Journey"
            desc="Manage timeline, eras, and bio data."
            href="/admin/about-handling"
            icon={User}
            colorClass="text-purple-500"
            delay={0.65}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-12 flex justify-between items-center border-t border-neutral-200 pt-6">
        <p className="font-mono text-xs text-neutral-400">
          V2.0.4 • NEXT.JS SYSTEM ARCHITECTURE
        </p>
        <div className="flex gap-4">
          <Cpu className="w-4 h-4 text-neutral-300" />
          <Activity className="w-4 h-4 text-neutral-300" />
        </div>
      </div>
    </div>
  );
}
