import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { TOOLS } from "@/app/lib/jiva/tools";
import { JivaRequestSchema } from "@/app/lib/jiva/validators";
import {
  RESPONSE_TYPES,
  ACTION_TYPES,
  JIVA_CONFIG,
} from "@/app/lib/jiva/constants";
import { jivaConfig } from "@/app/lib/jiva/config";
import { checkRateLimit, getClientIdentifier } from "@/app/lib/jiva/rate-limit";

// Setup Gemini Client (lazy initialization to avoid errors at module load)
function getGenAI() {
  const apiKey = jivaConfig.apiKey;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    if (jivaConfig.rateLimit.enabled) {
      const clientId = getClientIdentifier(req);
      const rateLimitResult = checkRateLimit(clientId, {
        maxRequests: jivaConfig.rateLimit.maxRequests,
        windowMs: jivaConfig.rateLimit.windowMs,
      });

      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please try again later.",
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": String(jivaConfig.rateLimit.maxRequests),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(rateLimitResult.resetTime),
              "Retry-After": String(
                Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
              ),
            },
          }
        );
      }
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = JivaRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { history, message } = validationResult.data;

    const genAI = getGenAI();
    const modelName = jivaConfig.model;

    // Map history safely (already validated by schema)
    const chatHistory = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Initialize Model with Tools
    const model = genAI.getGenerativeModel({
      model: modelName,
      tools: TOOLS as any,
      toolConfig: { functionCallingConfig: { mode: "AUTO" as any } },
    });

    // Start Chat
    const chat = model.startChat({
      history: chatHistory,
    });

    // Send Message
    const result = await chat.sendMessage(message);
    const response = result.response;

    // Check for function calls
    const functionCalls = response.functionCalls();

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];

      if (call.name === ACTION_TYPES.NAVIGATE) {
        return NextResponse.json({
          type: RESPONSE_TYPES.ACTION,
          action: ACTION_TYPES.NAVIGATE,
          args: call.args || {},
          text: JIVA_CONFIG.NAVIGATION_MESSAGE,
        });
      }
    }

    // Standard Text Response
    const responseText = response.text();
    return NextResponse.json({
      type: RESPONSE_TYPES.MESSAGE,
      text: responseText || JIVA_CONFIG.DEFAULT_MESSAGE,
    });
  } catch (error) {
    console.error("Jiva Core Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Internal Jiva Error";

    // Check for API key errors
    if (
      errorMessage.includes("API key expired") ||
      errorMessage.includes("API_KEY_INVALID") ||
      errorMessage.includes("GEMINI_API_KEY is not set")
    ) {
      return NextResponse.json(
        {
          error: errorMessage.includes("expired")
            ? "Your API key has expired. Please renew it at https://aistudio.google.com/apikey"
            : "Gemini API key not configured. Please set GEMINI_API_KEY in your environment variables.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Jiva Core Error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
