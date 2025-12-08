/**
 * Navigation Agent Constants
 * Centralized constants to avoid magic strings
 */

export const RESPONSE_TYPES = {
  ACTION: "action",
  MESSAGE: "message",
} as const;

export const ACTION_TYPES = {
  NAVIGATE: "navigate",
} as const;

export const VALID_PATHS = [
  "/",
  "/about",
  "/skills",
  "/projects",
  "/contact",
  "/jiva",
] as const;

export type ValidPath = (typeof VALID_PATHS)[number];

export const JIVA_CONFIG = {
  API_ENDPOINT: "/api/jiva",
  DEFAULT_MODEL: "gemini-2.5-flash",
  DEFAULT_MESSAGE:
    "I'm here to help you navigate. Try asking me to go to a specific page.",
  NAVIGATION_MESSAGE: "Navigating you now...",
} as const;
