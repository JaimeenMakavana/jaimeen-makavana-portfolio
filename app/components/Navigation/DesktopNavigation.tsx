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
import { NavigationLinkItem } from "./NavigationLink";
import { NavigationLink } from "./useNavigationHover";
import { ThemeToggle } from "../ThemeToggle";
import { useState } from "react";

interface DesktopNavigationProps {
  activeLink: NavigationLink;
  onMouseEnter: (link: NavigationLink) => void;
  onMouseLeave: () => void;
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

const containerVariants = {
  hidden: { opacity: 0, height: 0, overflow: "hidden" },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.8 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.8 },
};

export const DesktopNavigation = ({
  activeLink,
  onMouseEnter,
  onMouseLeave,
}: DesktopNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Split items for top and bottom of FAB
  const topItems = NAVIGATION_ITEMS.slice(0, 2);
  const bottomItems = NAVIGATION_ITEMS.slice(2);

  return (
    <nav
      className="hidden md:block fixed right-6 top-1/2 -translate-y-1/2 z-50"
      aria-label="Main navigation"
    >
      {/* Contact FAB */}
      <motion.div
        className="relative group mb-2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Link
          href="/contact"
          className="shiny-cta size-14 flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 focus:outline-none"
          aria-label="Contact"
        >
          <Mail className="w-5 h-5" strokeWidth={1.5} />
        </Link>
        <span
          className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2 py-1 rounded whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            backgroundColor: "var(--nav-surface)",
            color: "var(--bg-accent-glow)",
          }}
        >
          Contact
        </span>
      </motion.div>
      {/* Jiva Agent FAB */}
      <motion.div
        className="relative group mb-2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Link
          href="/jiva"
          className="size-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95"
          style={{
            backgroundColor: "var(--nav-surface)",
            color:
              activeLink === "jiva"
                ? "var(--bg-accent-glow)"
                : "var(--nav-text-idle)",
          }}
          aria-label="जीवा: AI Agent"
        >
          <Sparkles className="w-5 h-5" strokeWidth={1} />
        </Link>
        <span
          className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2 py-1 rounded whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            backgroundColor:
              activeLink === "jiva"
                ? "var(--bg-accent-glow)"
                : "var(--nav-surface)",
            color:
              activeLink === "jiva"
                ? "var(--text-display)"
                : "var(--nav-text-idle)",
          }}
        >
          जीवा: AI agent
        </span>
      </motion.div>

      <motion.div
        className="px-2 py-2 rounded-full flex flex-col items-center gap-3 shadow-lg"
        style={{
          backgroundColor: "var(--nav-surface)",
          color: "var(--nav-text-idle)",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="flex flex-col items-center gap-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Top items */}
              {topItems.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <NavigationLinkItem
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    activeLink={activeLink}
                    linkId={item.id}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                  />
                </motion.div>
              ))}

              {/* Bottom items */}
              {bottomItems.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <NavigationLinkItem
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    activeLink={activeLink}
                    linkId={item.id}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                  />
                </motion.div>
              ))}

              {/* Theme Toggle */}
              <motion.div variants={itemVariants}>
                <ThemeToggle variant="desktop" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </nav>
  );
};
