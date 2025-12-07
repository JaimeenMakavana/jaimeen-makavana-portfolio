/**
 * Navigation Agent Configuration
 * Centralized configuration management
 */

export const jivaConfig = {
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  apiEndpoint: "/api/jiva",
  apiKey: process.env.GEMINI_API_KEY,

  // Rate limiting (simple in-memory implementation)
  rateLimit: {
    enabled: process.env.NODE_ENV === "production",
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },

  // Feature flags
  features: {
    conversationPersistence: false, // TODO: Implement
    responseCaching: false, // TODO: Implement
  },
} as const;
