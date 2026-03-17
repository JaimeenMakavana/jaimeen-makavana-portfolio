import {
  SchemaType,
  type FunctionDeclaration,
  type Tool,
} from "@google/generative-ai";

/**
 * Navigation Agent Tool Definitions
 * Centralized tool schemas for Gemini API
 */

export const NAVIGATE_TOOL: FunctionDeclaration = {
  name: "navigate",
  description: "Navigates the user to a specific page in the portfolio.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      path: {
        type: SchemaType.STRING as const,
        description:
          "The path to navigate to. Valid options: '/', '/about', '/skills', '/projects', '/contact', '/jiva'",
      },
      filter: {
        type: SchemaType.STRING as const,
        description:
          "Optional category filter for projects (e.g., 'AI', 'React', 'System Design')",
      },
    },
    required: ["path"],
  },
};

export const TOOLS: Tool[] = [
  {
    functionDeclarations: [NAVIGATE_TOOL],
  },
];
