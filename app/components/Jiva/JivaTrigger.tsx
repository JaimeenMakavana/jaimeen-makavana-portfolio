"use client";

import { useJivaPresence } from "../../context/JivaPresenceContext";

interface JivaTriggerProps {
  children: React.ReactNode;
  message: string; // What should Jiva think?
  className?: string;
  onClick?: () => void;
}

export const JivaTrigger = ({
  children,
  message,
  className,
  onClick,
}: JivaTriggerProps) => {
  const { setJivaIntent } = useJivaPresence();

  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => setJivaIntent("watching", message)}
      onMouseLeave={() => setJivaIntent("idle")}
    >
      {children}
    </div>
  );
};
