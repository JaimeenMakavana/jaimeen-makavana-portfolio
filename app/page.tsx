"use client";

import { HeroText } from "./components/Hero/HeroText";
import { MobileHeroSection } from "./components/Hero/MobileHeroSection";
import { DesktopHeroSection } from "./components/Hero/DesktopHeroSection";

const Page = () => {
  return (
    <div className="h-dvh relative bg-hero-glow p-4 space-y-4 md:p-6 overflow-hidden pb-24 md:pb-6">
      <HeroText />
      <MobileHeroSection />
      <DesktopHeroSection />
    </div>
  );
};

export default Page;
