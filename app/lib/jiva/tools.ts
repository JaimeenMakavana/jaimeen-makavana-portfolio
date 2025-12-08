/**
 * Navigation Agent Tool Definitions
 * Centralized tool schemas for Gemini API
 */

export const NAVIGATE_TOOL = {
  name: "navigate",
  description: "Navigates the user to a specific page in the portfolio.",
  parameters: {
    type: "OBJECT" as const,
    properties: {
      path: {
        type: "STRING" as const,
        description:
          "The path to navigate to. Valid options: '/', '/about', '/skills', '/projects', '/contact', '/jiva'",
      },
      filter: {
        type: "STRING" as const,
        description:
          "Optional category filter for projects (e.g., 'AI', 'React', 'System Design')",
      },
    },
    required: ["path"],
  },
};

export const TOOLS = [
  {
    functionDeclarations: [NAVIGATE_TOOL],
  },
];
