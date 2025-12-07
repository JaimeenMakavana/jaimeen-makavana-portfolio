import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
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

// --- RAG UTILITIES ---

interface IndexEntry {
  id: string;
  path: string;
  content: string;
  embedding: number[];
}

// Load the "Brain" (lazy load, cached)
let knowledgeBase: IndexEntry[] = [];
let knowledgeBaseLoaded = false;

function loadKnowledgeBase() {
  if (knowledgeBaseLoaded) return;

  const knowledgeBasePath = path.join(
    process.cwd(),
    "app/data/codebase-index.json"
  );

  try {
    if (fs.existsSync(knowledgeBasePath)) {
      knowledgeBase = JSON.parse(fs.readFileSync(knowledgeBasePath, "utf-8"));
      knowledgeBaseLoaded = true;
      console.log(`📚 Loaded ${knowledgeBase.length} codebase entries`);
    } else {
      console.warn(
        "⚠️  Codebase index not found. Run 'npm run embed' to generate it."
      );
    }
  } catch (e) {
    console.error("Failed to load knowledge base", e);
  }
}

// Cosine Similarity Function
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

// Retrieval Function
async function retrieveContext(
  query: string,
  genAI: GoogleGenerativeAI
): Promise<string> {
  loadKnowledgeBase();

  if (knowledgeBase.length === 0) {
    return "";
  }

  try {
    // Embed the USER'S query
    const embeddingModel = genAI.getGenerativeModel({
      model: "text-embedding-004",
    });

    // Use string directly - SDK supports this format
    const result = await embeddingModel.embedContent(query);

    const queryVector = result.embedding.values;

    if (!queryVector || queryVector.length === 0) {
      return "";
    }

    // Compare with every file in our codebase
    const scoredDocs = knowledgeBase
      .map((doc) => ({
        ...doc,
        score: cosineSimilarity(queryVector, doc.embedding),
      }))
      .filter((doc) => doc.score > 0.3) // Filter low relevance
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3 files

    if (scoredDocs.length === 0) {
      return "";
    }

    console.log(
      "🔍 Relevant files found:",
      scoredDocs.map((d) => `${d.path} (${d.score.toFixed(3)})`)
    );

    return scoredDocs
      .map((doc) => `File: ${doc.path}\nCode:\n${doc.content}`)
      .join("\n\n---\n\n");
  } catch (error) {
    console.error("Error during retrieval:", error);
    return "";
  }
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

    // 1. Decide if we need RAG (Heuristic detection)
    const isTechnicalQuestion =
      /code|stack|implement|how|architecture|component|function|hook|api|route|file|structure|build|deploy/i.test(
        message
      );

    let context = "";
    if (isTechnicalQuestion) {
      console.log("🔍 Technical question detected. Searching codebase...");
      context = await retrieveContext(message, genAI);
    }

    // 2. Build system instruction with context
    const systemInstruction = context
      ? `You are Jiva, an expert AI software engineer who built this portfolio.

Here is the actual source code relevant to the user's question:

${context}

Answer based on the provided code. Be concise, technical, and reference specific files/components when relevant. If the code doesn't answer the question, say so honestly.`
      : `You are Jiva, an expert AI software engineer who built this portfolio. Answer questions about the portfolio, codebase, and help users navigate.`;

    // Map history safely (already validated by schema)
    const chatHistory = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // 3. Initialize Model with Tools AND System Instruction
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstruction,
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
