import { HeroText } from "./components/Hero/HeroText";
import { MobileHeroSection } from "./components/Hero/MobileHeroSection";
import { DesktopHeroSection } from "./components/Hero/DesktopHeroSection";
import { SentientCursor } from "./components/SentientCursor";

const Page = () => {
  return (
    <div
      className="h-dvh relative p-4 space-y-4 md:p-6 overflow-hidden pb-24 md:pb-6"
      style={{
        background:
          "radial-gradient(circle at 50% 30%, var(--bg-accent-glow) 0%, var(--bg-canvas) 70%)",
      }}
    >
      <SentientCursor />
      <HeroText />
      <MobileHeroSection />
      <DesktopHeroSection />
    </div>
  );
};

export default Page;
