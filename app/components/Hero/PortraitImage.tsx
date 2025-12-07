"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const IMAGE_CONFIG = {
  src: "/images/mine-image-3.png",
  alt: "Jay makavana Portrait",
  width: 500,
  defaultHeight: 800,
  desktopHeight: 1000,
} as const;

interface PortraitImageProps {
  className: string;
  style?: React.CSSProperties;
  priority?: boolean;
  height?: number;
}

export const PortraitImage = ({
  className,
  style,
  priority = false,
  height = IMAGE_CONFIG.defaultHeight,
}: PortraitImageProps) => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if dark mode is active
  const isDark =
    mounted &&
    (theme === "dark" || (theme === "system" && systemTheme === "dark"));

  // Theme-aware gradient mask: use black in light mode, white in dark mode
  const gradientMask = isDark
    ? "linear-gradient(to bottom, white 80%, transparent 100%)"
    : "linear-gradient(to bottom, black 80%, transparent 100%)";

  return (
    <Image
      src={IMAGE_CONFIG.src}
      alt={IMAGE_CONFIG.alt}
      width={IMAGE_CONFIG.width}
      height={height}
      className={className}
      style={{
        WebkitMaskImage: gradientMask,
        maskImage: gradientMask,
        ...style,
      }}
      priority={priority}
    />
  );
};
