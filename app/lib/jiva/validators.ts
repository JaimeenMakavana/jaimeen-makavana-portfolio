/**
 * Request/Response Validation Schemas
 * Using Zod for runtime validation
 */

import { z } from "zod";
import { VALID_PATHS } from "./constants";

// Message schema
export const MessageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.string(),
});

// Request body schema
export const JivaRequestSchema = z.object({
  history: z.array(MessageSchema).optional().default([]),
  message: z.string().min(1, "Message cannot be empty"),
});

// Path validation
export function isValidPath(path: string): boolean {
  return VALID_PATHS.includes(path as any);
}

// Action args schema
export const NavigateActionArgsSchema = z.object({
  path: z.string().refine(isValidPath, {
    message: `Path must be one of: ${VALID_PATHS.join(", ")}`,
  }),
  filter: z.string().optional(),
});

export type JivaRequest = z.infer<typeof JivaRequestSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type NavigateActionArgs = z.infer<typeof NavigateActionArgsSchema>;
