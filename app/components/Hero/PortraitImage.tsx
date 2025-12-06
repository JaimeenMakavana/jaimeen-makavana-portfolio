import Image from "next/image";

const IMAGE_CONFIG = {
  src: "/images/mine-image-3.png",
  alt: "Jay makavana Portrait",
  width: 500,
  defaultHeight: 800,
  desktopHeight: 1000,
} as const;

const GRADIENT_MASK =
  "linear-gradient(to bottom, black 80%, transparent 100%)";

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
      style={{
        WebkitMaskImage: GRADIENT_MASK,
        maskImage: GRADIENT_MASK,
        ...style,
      }}
      priority={priority}
    />
  );
};

