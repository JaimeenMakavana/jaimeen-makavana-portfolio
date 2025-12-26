const MOBILE_TEXT =
  "Engineering smarter products with Next.js, Python, and a stubborn obsession for AI";

export const HeroText = () => {
  return (
    <div
      style={{ color: "var(--text-body)" }}
      className="lg:max-w-1/2 lg:ml-20 lg:h-full lg:flex items-center justify-center z-20 relative"
    >
      <p
        className="text-4xl font-bold leading-tight text-center md:text-7xl lg:hidden"
        style={{ fontFamily: "var(--font-poiret), sans-serif" }}
      >
        {MOBILE_TEXT}
      </p>
      <p
        className="text-5xl font-bold leading-tight text-center md:text-5xl 2xl:text-5xl lg:block hidden"
        style={{ fontFamily: "var(--font-poiret), sans-serif" }}
      >
        I'm{" "}
        <span className="inline-block bg-linear-to-r from-(--text-display) via-(--bg-accent-glow) to-(--text-display) bg-clip-text text-transparent">
          Jaimeen Makavana
        </span>
        , a frontend developer who specializes in crafting scalable, thoughtful,
        AI-ready software. Engineering smarter products with Next.js, Python,
        and a stubborn obsession for AI
      </p>
    </div>
  );
};
