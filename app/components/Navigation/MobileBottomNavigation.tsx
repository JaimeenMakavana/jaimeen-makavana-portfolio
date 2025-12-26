"use client";

import { useState } from "react";
import {
  FolderKanban,
  Home,
  Mail,
  User,
  Sparkles,
  Menu,
  X,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NavigationLink } from "./useNavigationHover";
import { ThemeToggle } from "../ThemeToggle";

interface MobileBottomNavigationProps {
  activeLink: NavigationLink;
  onLinkClick: (link: NavigationLink) => void; // Added to close menu on click
}

const NAVIGATION_ITEMS = [
  { id: "home" as const, href: "/", label: "Home", icon: Home },
  { id: "about" as const, href: "/about", label: "About", icon: User },
  { id: "skills" as const, href: "/skills", label: "Skills", icon: Cpu },
  {
    id: "projects" as const,
    href: "/projects",
    label: "Projects",
    icon: FolderKanban,
  },
] as const;

export const MobileBottomNavigation = ({
  activeLink,
  onLinkClick,
}: MobileBottomNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Animation Variants
  const containerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1, // Stagger from bottom to top when closing
      },
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1, // Stagger from bottom to top when opening
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <>
      {/* This is a "Click-outside" backdrop. 
        If the menu is open, clicking anywhere else closes it.
      */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50 flex items-end justify-between pointer-events-none">
        {/* --- LEFT: JIVA AGENT & CONTACT FABS --- */}
        <div className="flex flex-row gap-3 pointer-events-auto">
          {/* Jiva Agent FAB */}
          <Link
            href="/jiva"
            onClick={() => onLinkClick(null)}
            className="h-14 px-4 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-90 hover:scale-105 gap-2"
            style={{
              backgroundColor: "var(--bg-accent-glow)",
              color: "black",
            }}
            aria-label="जीवा: AI Agent"
          >
            <Sparkles className="w-6 h-6" strokeWidth={1.5} />
            <span className="text-xs font-medium whitespace-nowrap">
              जीवा: AI agent
            </span>
          </Link>
          {/* Contact FAB */}
          <Link
            href="/contact"
            onClick={() => onLinkClick(null)}
            className="h-14 px-4 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-90 hover:scale-105 gap-2"
            style={{
              backgroundColor: "var(--bg-accent-glow)",
              color: "black",
            }}
            aria-label="Contact"
          >
            <Mail className="w-6 h-6" strokeWidth={1.5} />
            <span className="text-xs font-medium whitespace-nowrap">
              Contact
            </span>
          </Link>
        </div>

        {/* --- RIGHT: MENU SYSTEM --- */}
        <div className="flex flex-col items-end gap-4 pointer-events-auto">
          {/* THE STAGGERED MENU LIST */}
          <AnimatePresence>
            {isOpen && (
              <motion.nav
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={containerVariants}
                className="flex flex-col items-end gap-3 mb-2"
              >
                {/* 2. Navigation Items */}
                {NAVIGATION_ITEMS.map((item) => {
                  const isActive = activeLink === item.id;
                  const Icon = item.icon;

                  return (
                    <motion.div key={item.id} variants={itemVariants}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          onLinkClick(item.id);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 pr-1 pl-4 py-1 rounded-full shadow-xl border border-white/10 backdrop-blur-md"
                        style={{
                          backgroundColor: "var(--nav-surface)",
                        }}
                      >
                        {/* Label */}
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--nav-text-idle)" }}
                        >
                          {item.label}
                        </span>

                        {/* Icon Bubble */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: isActive
                              ? "var(--bg-accent-glow)"
                              : "rgba(255,255,255,0.1)",
                            color: isActive ? "black" : "var(--nav-text-idle)",
                          }}
                        >
                          <Icon className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
                {/* 1. Theme Toggle (Top of stack) */}
                <motion.div variants={itemVariants}>
                  <div
                    className="p-3 rounded-full shadow-lg border border-white/10"
                    style={{ backgroundColor: "var(--nav-surface)" }}
                  >
                    <ThemeToggle />
                  </div>
                </motion.div>
              </motion.nav>
            )}
          </AnimatePresence>

          {/* THE HAMBURGER TRIGGER BUTTON */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-90"
            style={{
              backgroundColor: "var(--nav-surface)",
              color: "var(--nav-text-idle)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            aria-label="Toggle Menu"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.div>
          </button>
        </div>
      </div>
    </>
  );
};
