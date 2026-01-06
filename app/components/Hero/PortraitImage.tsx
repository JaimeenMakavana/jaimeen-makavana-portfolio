"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const IMAGE_CONFIG = {
  src: "/images/jaimeen2.png",
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
  return (
    <Image
      src={IMAGE_CONFIG.src}
      alt={IMAGE_CONFIG.alt}
      width={IMAGE_CONFIG.width}
      height={height}
      className={className}
      priority={priority}
    />
  );
};
