import { PortraitImage } from "./PortraitImage";

const NAME_TEXT = "Jaimeen";

export const DesktopHeroSection = () => {
  return (
    <>
      <PortraitImage
        className="hidden lg:block absolute right-0 2xl:right-20 2xl:top-20 z-10 top-0 h-full w-auto subject-image object-contain"
        height={1000}
        priority
      />
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-[20px] w-full z-0 hidden lg:block">
        <h1
          className="font-display text-[22vw] leading-none tracking-tighter select-none text-end m-0 p-0"
          style={{
            color: "var(--text-display)",
            opacity: 0.1,
          }}
        >
          {NAME_TEXT}
        </h1>
      </div>
    </>
  );
};
