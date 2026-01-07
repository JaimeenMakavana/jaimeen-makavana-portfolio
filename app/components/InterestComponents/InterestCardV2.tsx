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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 12px 40px -4px rgba(0, 0, 0, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 20px -2px rgba(0, 0, 0, 0.1)";
      }}
    >
      {/* Image Section - Takes ~2/3 of card */}
      <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
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
              background: `linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)`,
            }}
          />
        )}
      </div>

      {/* Glass Effect Content Overlay at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div
          style={{
            background:
              "linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 30%,transparent 60%, transparent 100%)",
            backdropFilter: "blur(2px) saturate(180%)",
            WebkitBackdropFilter: "blur(2px) saturate(180%)",
            boxShadow: "0 -4px 20px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="p-5 flex flex-col gap-4">
            {/* Title with Verified Badge */}
            <div className="flex items-center gap-2">
              <h3
                className="font-bold text-2xl leading-tight"
                style={{ color: "var(--text-display)" }}
              >
                {interest.title}
              </h3>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: "var(--bg-accent-glow)",
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
              style={{ color: "var(--text-body)" }}
            >
              {interest.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
