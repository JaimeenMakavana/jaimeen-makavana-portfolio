import { Menu } from "lucide-react";

export const MobileMenuButton = () => {
  return (
    <button
      className="rounded-full p-2 flex items-center justify-end shadow-lg md:hidden"
      style={{
        backgroundColor: "var(--nav-surface)",
      }}
      aria-label="Open menu"
      type="button"
    >
      <Menu
        className="size-5"
        style={{
          color: "var(--nav-text-idle)",
        }}
        strokeWidth={1}
        aria-hidden="true"
      />
    </button>
  );
};

