"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { executeAction } from "@/app/lib/jiva/actions";
import {
  RESPONSE_TYPES,
  ACTION_TYPES,
  JIVA_CONFIG,
} from "@/app/lib/jiva/constants";
import type { Message } from "@/app/lib/jiva/validators";

export const useJivaCore = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    const currentInput = input;
    setInput("");

    try {
      const res = await fetch(JIVA_CONFIG.API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages, // Send context
          message: currentInput,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        // If response is not JSON, read as text
        const text = await res.text();
        throw new Error(
          `Server returned non-JSON response (${res.status}): ${text.substring(
            0,
            100
          )}`
        );
      }

      if (!res.ok) {
        const errorMsg =
          data?.error ||
          data?.message ||
          `HTTP ${res.status}: Failed to communicate with Jiva Core`;
        throw new Error(errorMsg);
      }

      // --- THE "HANDS" LOGIC ---
      if (data.type === RESPONSE_TYPES.ACTION) {
        // Use action registry for extensibility
        try {
          // Feedback to user
          setMessages((prev) => [
            ...prev,
            {
              role: "model",
              content: data.text || `Executing ${data.action}...`,
            },
          ]);

          // Execute action using registry
          executeAction(data.action, data.args, {
            router: {
              push: (path: string) => router.push(path),
            },
          });
        } catch (actionError) {
          // Action execution failed
          setMessages((prev) => [
            ...prev,
            {
              role: "model",
              content:
                actionError instanceof Error
                  ? `Action failed: ${actionError.message}`
                  : "Action execution failed.",
            },
          ]);
        }
      } else {
        // Standard text response
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: data.text || "No response from Jiva Core.",
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            error instanceof Error
              ? `Jiva Core offline: ${error.message}`
              : "Jiva Core offline.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, input, setInput, sendMessage, isLoading };
};
