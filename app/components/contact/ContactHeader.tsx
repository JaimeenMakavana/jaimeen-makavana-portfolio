"use client";

export const ContactHeader = () => {
  return (
    <div className="max-w-7xl mx-auto mb-12">
      <h1
        className="text-[12vw] md:text-[7vw] leading-[0.8] font-black uppercase tracking-tighter mb-6"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--text-display)",
        }}
      >
        Start The <br />{" "}
        <span
          className="text-transparent"
          style={{
            WebkitTextStroke: "1px var(--text-display)",
            color: "var(--bg-accent-glow)",
          }}
        >
          Transformation
        </span>
      </h1>
      <div
        className="flex flex-col md:flex-row justify-between items-end gap-6 border-b pb-8"
        style={{ borderColor: "var(--text-display)" }}
      >
        <p
          className="max-w-xl text-lg md:text-xl font-light"
          style={{ color: "var(--text-muted)" }}
        >
          Ready to engineer something scalable? I treat every message as a
          high-priority signal.
          <span
            className="block mt-2 font-medium"
            style={{ color: "var(--text-display)" }}
          >
            Average response time: &lt; 24 Hours.
          </span>
        </p>
      </div>
    </div>
  );
};
