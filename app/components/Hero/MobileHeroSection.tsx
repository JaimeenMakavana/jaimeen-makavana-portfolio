import { PortraitImage } from "./PortraitImage";

const NAME_TEXT = "Jaimeen";

export const MobileHeroSection = () => {
  return (
    <div className="absolute inset-0 z-10 lg:hidden">
      <div className="flex flex-col justify-between h-full">
        <div aria-hidden="true" />
        <div className="relative">
          <h1
            className="absolute bottom-[70px] left-0 right-0 w-full font-display text-[32vw] leading-none tracking-tighter select-none text-center"
            style={{
              color: "var(--text-display)",
              opacity: 0.5,
            }}
          >
            {NAME_TEXT}
          </h1>
          <PortraitImage
            className="subject-image w-full md:w-[70%] mx-auto object-contain mb-[80px]"
            style={{ opacity: 0.7 }}
            priority
          />
        </div>
      </div>
    </div>
  );
};
