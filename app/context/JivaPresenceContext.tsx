"use client";

import React, { createContext, useContext, useState } from "react";

type JivaState = "idle" | "watching" | "reading" | "acting";

interface JivaPresenceState {
  state: JivaState;
  message: string | null;
  setJivaIntent: (state: JivaState, message?: string | null) => void;
}

const JivaPresenceContext = createContext<JivaPresenceState | undefined>(undefined);

export const JivaPresenceProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<JivaState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const setJivaIntent = (newState: JivaState, newMessage: string | null = null) => {
    setState(newState);
    setMessage(newMessage);
  };

  return (
    <JivaPresenceContext.Provider value={{ state, message, setJivaIntent }}>
      {children}
    </JivaPresenceContext.Provider>
  );
};

export const useJivaPresence = () => {
  const context = useContext(JivaPresenceContext);
  if (!context) throw new Error("useJivaPresence must be used within a Provider");
  return context;
};

