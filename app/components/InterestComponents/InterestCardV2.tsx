"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { InterestItem } from "./types";

interface InterestCardV2Props {
  interest: InterestItem;
  index: number;
}

export const InterestCardV2 = ({ interest, index }: InterestCardV2Props) => {
  const hasImage = interest.image && interest.image.length > 0;

  return (
    <div
      className="relative h-full"
      style={{
        perspective: "1100px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{
          rotateX: 18,
          rotateY: -14,
          translateY: -16,
          backgroundPosition: "-80px 80px, -80px 80px",
        }}
        transition={{
          delay: index * 0.15,
          duration: 0.5,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className="group relative rounded-2xl overflow-hidden flex flex-col h-full will-change-transform"
        style={{
          backgroundImage:
            "linear-gradient(135deg,transparent 18.75%,rgba(255,255,255,0.06) 0 31.25%,transparent 0),repeating-linear-gradient(45deg,rgba(255,255,255,0.04) -6.25% 6.25%,rgba(255,255,255,0.08) 0 18.75%)",
          backgroundSize: "60px 60px",
          backgroundPosition: "0 0, 0 0",
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          boxShadow: "0 26px 40px -18px rgba(15, 23, 42, 0.65)",
          transformStyle: "preserve-3d",
          transition: "background-position 0.6s ease, box-shadow 0.6s ease",
        }}
      >
        {/* Image Section - main 3D plane */}
        <div
          className="relative w-full"
          style={{ aspectRatio: "3/4", transform: "translateZ(25px)" }}
        >
          {hasImage ? (
            <>
              <Image
                src={interest.image}
                alt={interest.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index < 2}
              />
              {/* Subtle gradient overlay at bottom for smooth transition */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.1) 70%, rgba(0, 0, 0, 0.3) 100%)",
                }}
              />
            </>
          ) : (
            // Fallback gradient
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)",
              }}
            />
          )}
        </div>

        {/* Floating metadata box inspired by 3D date badge */}
        {interest.metadata?.length ? (
          <div
            className="absolute top-4 right-4 rounded-xl px-3 py-2 text-[10px] font-semibold flex flex-col items-center justify-center shadow-md"
            style={{
              backgroundColor: "var(--bg-canvas)",
              border: "1px solid var(--bg-accent-glow)",
              transform: "translateZ(70px)",
              boxShadow: "0 18px 30px -12px rgba(15, 23, 42, 0.6)",
            }}
          >
            <span
              className="tracking-[0.16em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              {interest.metadata[0].label}
            </span>
            <span
              className="text-xs mt-0.5"
              style={{ color: "var(--bg-accent-glow)" }}
            >
              {interest.metadata[0].value}
            </span>
          </div>
        ) : null}

        {/* Glass Effect Content Overlay at Bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10"
          style={{
            transform: "translateZ(50px)",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(to top, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.88) 30%,transparent 65%, transparent 100%)",
              backdropFilter: "blur(4px) saturate(180%)",
              WebkitBackdropFilter: "blur(4px) saturate(180%)",
              boxShadow: "0 -6px 22px 0 rgba(15, 23, 42, 0.35)",
            }}
          >
            <div className="p-5 flex flex-col gap-3">
              {/* Category */}
              <p
                className="text-[10px] font-mono uppercase tracking-[0.22em]"
                style={{
                  color: "var(--text-muted)",
                  transform: "translateZ(40px)",
                }}
              >
                {interest.category}
              </p>

              {/* Title with Verified Badge */}
              <div className="flex items-center gap-2">
                <h3
                  className="font-bold text-2xl leading-tight"
                  style={{
                    color: "var(--text-display)",
                    transform: "translateZ(60px)",
                  }}
                >
                  {interest.title}
                </h3>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "var(--bg-accent-glow)",
                    transform: "translateZ(80px)",
                  }}
                  aria-label="Verified"
                >
                  <Check
                    className="w-3 h-3"
                    style={{ color: "var(--text-display)" }}
                    strokeWidth={3}
                  />
                </div>
              </div>

              {/* Description */}
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: "var(--nav-surface)",
                  transform: "translateZ(40px)",
                }}
              >
                {interest.description}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
