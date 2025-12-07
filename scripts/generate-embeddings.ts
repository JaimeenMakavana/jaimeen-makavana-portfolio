import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { glob } from "glob";
import dotenv from "dotenv";
import crypto from "crypto";

// Load environment variables (try .env.local first, then .env)
dotenv.config({ path: ".env.local" });
if (!process.env.GEMINI_API_KEY) {
  dotenv.config({ path: ".env" });
}

// Configuration
const TARGET_FILES = "app/**/*.{ts,tsx,css,md}";
const IGNORE_PATTERNS = [
  "app/api/jiva/**", // Don't embed the API itself
  "**/*.d.ts",
  "**/node_modules/**",
  "**/.next/**",
];

const MAX_FILE_SIZE = 20000; // 20KB
const MIN_FILE_SIZE = 50;

interface IndexEntry {
  id: string;
  path: string;
  content: string;
  embedding: number[];
  hash: string; // For incremental updates
}

async function generateEmbeddings() {
  console.log("🚀 Starting Codebase Indexing...");

  if (!process.env.GEMINI_API_KEY) {
    console.error("\n❌ Error: GEMINI_API_KEY not found!");
    console.error("📝 For local development: Create a .env.local file with GEMINI_API_KEY");
    console.error("📝 For Vercel: Set GEMINI_API_KEY in Vercel project environment variables");
    console.error("💡 Get your API key from: https://aistudio.google.com/apikey\n");
    
    // In Vercel, we want the build to fail if the key is missing
    // In local dev, we can be more lenient
    if (process.env.VERCEL) {
      console.error("⚠️  Build environment detected. Failing build to prevent deployment without embeddings.");
      process.exit(1);
    } else {
      console.warn("⚠️  Continuing without embeddings (local development mode)");
      // Create empty index file
      const indexPath = path.join(process.cwd(), "app/data/codebase-index.json");
      const outputDir = path.dirname(indexPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(indexPath, JSON.stringify([], null, 2));
      console.log("✅ Created empty index file. RAG feature will be disabled until API key is set.");
      return;
    }
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // 1. Find all files
  const files = await glob(TARGET_FILES, { 
    ignore: IGNORE_PATTERNS,
    cwd: process.cwd(),
  });

  console.log(`📂 Found ${files.length} files to index.`);

  // Load existing index for incremental updates
  const indexPath = path.join(process.cwd(), "app/data/codebase-index.json");
  let existingIndex: IndexEntry[] = [];
  
  if (fs.existsSync(indexPath)) {
    try {
      existingIndex = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
      console.log(`📚 Found existing index with ${existingIndex.length} entries.`);
    } catch (e) {
      console.warn("⚠️  Could not load existing index, starting fresh.");
    }
  }

  // Create hash map for quick lookup
  const existingHashes = new Map<string, string>();
  existingIndex.forEach(entry => {
    existingHashes.set(entry.path, entry.hash);
  });

  const vectorStore: IndexEntry[] = [];
  // Try text-embedding-004 first (fallback if 005 not available)
  const embeddingModel = genAI.getGenerativeModel({ 
    model: "text-embedding-004"
  });

  let processed = 0;
  let skipped = 0;

  // 2. Loop through files and generate embeddings
  for (const file of files) {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      skipped++;
      continue;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    
    // Skip empty or huge files
    if (content.length < MIN_FILE_SIZE || content.length > MAX_FILE_SIZE) {
      skipped++;
      continue;
    }

    // Calculate hash for incremental updates
    const hash = crypto.createHash("md5").update(content).digest("hex");
    
    // Skip if file hasn't changed
    if (existingHashes.get(file) === hash) {
      const existingEntry = existingIndex.find(e => e.path === file);
      if (existingEntry) {
        vectorStore.push(existingEntry);
        skipped++;
        continue;
      }
    }

    console.log(`🧠 Embedding [${processed + 1}/${files.length}]: ${file}`);

    try {
      // Generate Embedding - SDK supports string directly
      const result = await embeddingModel.embedContent(content);
      
      const embedding = result.embedding.values;

      if (!embedding || embedding.length === 0) {
        throw new Error("Empty embedding returned");
      }

      vectorStore.push({
        id: file,
        path: file,
        content: content,
        embedding: embedding,
        hash: hash,
      });

      processed++;

      // Rate limit protection (Gemini free tier: ~15 requests/second)
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms = ~10 req/s

    } catch (error) {
      console.error(`❌ Failed to embed ${file}:`, error);
      skipped++;
    }
  }

  // 3. Save to JSON
  const outputDir = path.dirname(indexPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(indexPath, JSON.stringify(vectorStore, null, 2));
  
  console.log(`\n✅ Index saved to ${indexPath}`);
  console.log(`📊 Statistics:`);
  console.log(`   - Processed: ${processed} files`);
  console.log(`   - Skipped (unchanged): ${skipped} files`);
  console.log(`   - Total entries: ${vectorStore.length} files`);
}

generateEmbeddings().catch(console.error);

