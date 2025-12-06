import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

// --- Types ---
type CareerMilestone = {
  era: string;
  title: string;
  description: string;
  image: string;
};

// --- Data ---
const CAREER_MILESTONES: CareerMilestone[] = [
  {
    era: "2016 - 2020",
    title: "Origins",
    description:
      "LD College of Engineering. Chemical Engineering basics. The gap between aptitude and passion revealed itself here.",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop",
  },
  {
    era: "2021",
    title: "The Pivot",
    description:
      "Long nights teaching myself Javascript, React, and Git from scratch. Rebuilding my career from zero.",
    image:
      "https://images.unsplash.com/photo-1510915361405-ef8a93d77744?q=80&w=2070&auto=format&fit=crop",
  },
  {
    era: "2022 - 2023",
    title: "Webapster",
    description:
      "First professional role. Real production chaos, UI systems, and state management. Theory became practice.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2070&auto=format&fit=crop",
  },
  {
    era: "2023 - 2024",
    title: "Koffeekodes",
    description:
      "Full-stack ownership. Designing backend flows, optimizing performance, and architectural thinking.",
    image:
      "https://images.unsplash.com/photo-1558494949-ef526b01201b?q=80&w=2070&auto=format&fit=crop",
  },
  {
    era: "Present",
    title: "Key.ai",
    description:
      "Intelligent software. Machine learning, prompt engineering, and multi-agent systems. Building intelligence.",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop",
  },
  {
    era: "Future",
    title: "The Next Leap",
    description: "May be LLM , lets see where it takes me.",
    image:
      "https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=2070&auto=format&fit=crop",
  },
];

const THEME = {
  bgCanvas: "#fafafa",
  accentGlow: "#e4e987",
  textDisplay: "#000000",
  textBody: "#1a1a1a",
  textMuted: "#666666",
};

// --- Sub-Component for Parallax Sections ---
const ParallaxSection = ({
  milestone,
  index,
  setRef,
  activeCard,
}: {
  milestone: CareerMilestone;
  index: number;
  setRef: (el: HTMLDivElement | null) => void;
  activeCard: number;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  // Track scroll progress of THIS section
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax Logic: Text moves against scroll direction
  const y = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

  // Physics: "Mass" adds weight/inertia, preventing micro-jitters
  const ySmooth = useSpring(y, { mass: 0.5, stiffness: 100, damping: 20 });

  return (
    <div
      ref={(el) => {
        ref.current = el;
        setRef(el);
      }}
      data-index={index}
      className="min-h-[85vh] md:min-h-screen flex items-center justify-center px-6 py-20 md:p-24 overflow-hidden relative"
    >
      <motion.div
        // Force GPU layer promotion to fix sub-pixel flickering
        style={{
          y: ySmooth,
          backfaceVisibility: "hidden",
          WebkitFontSmoothing: "antialiased",
        }}
        className="max-w-6xl w-full relative z-10 transform-gpu"
        animate={{
          opacity: activeCard === index ? 1 : 0.2,
          scale: activeCard === index ? 1 : 0.95,
          // Removed 'filter: blur()' transition to stop flickering
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="h-[2px] w-8 md:w-12 bg-black"></div>
          <span
            className="text-sm md:text-xl font-mono uppercase tracking-[0.2em]"
            style={{ color: THEME.textMuted }}
          >
            {milestone.era}
          </span>
        </div>

        <h1
          className="text-6xl sm:text-7xl md:text-9xl font-black leading-[0.9] mb-6 md:mb-10 tracking-tighter"
          style={{
            color: THEME.textDisplay,
            fontFamily: "var(--font-alumni), sans-serif",
          }}
        >
          {milestone.title}
        </h1>

        <div className="md:border-l-4 md:border-black md:pl-8">
          <p
            className="text-2xl md:text-3xl font-semibold leading-relaxed max-w-2xl"
            style={{
              color: THEME.textBody,
              fontFamily: "var(--font-alumni), sans-serif",
            }}
          >
            {milestone.description}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default function CareerTimeline() {
  const [activeCard, setActiveCard] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveCard(index);
          }
        });
      },
      {
        root: null,
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      }
    );

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="relative w-full overflow-x-hidden selection:bg-[#e4e987] selection:text-black"
      style={{
        backgroundColor: THEME.bgCanvas,
        fontFamily: "var(--font-alumni), sans-serif",
      }}
    >
      {/* --- BACKGROUND LAYER --- */}
      {/* 'transform-gpu' creates a new composite layer */}
      <div className="fixed inset-0 z-0 w-full h-full pointer-events-none transform-gpu">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeCard}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -20], // Gentle pan
            }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{
              opacity: { duration: 1 },
              scale: { duration: 1.5, ease: "easeOut" },
              y: { duration: 5, ease: "linear" },
            }}
            // 'will-change-transform' tells browser to optimize for movement
            className="absolute inset-0 w-full h-full will-change-transform"
          >
            <Image
              src={CAREER_MILESTONES[activeCard].image}
              alt="Background"
              fill
              className="object-cover opacity-[0.08] grayscale"
              sizes="100vw"
            />

            {/* Gradient Overlays */}
            <div
              className="absolute top-0 left-0 w-full h-[60vh] opacity-60"
              style={{
                background: `linear-gradient(to bottom, ${THEME.accentGlow} 0%, transparent 100%)`,
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-full h-[40vh]"
              style={{
                background: `linear-gradient(to top, ${THEME.bgCanvas} 0%, transparent 100%)`,
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 w-full pb-[20vh]">
        {CAREER_MILESTONES.map((milestone, index) => (
          <ParallaxSection
            key={index}
            index={index}
            milestone={milestone}
            activeCard={activeCard}
            setRef={(el) => (sectionRefs.current[index] = el)}
          />
        ))}
      </div>
    </div>
  );
}
