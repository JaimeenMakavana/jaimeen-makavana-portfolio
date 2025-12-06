# Contact Form API - GitHub Gist Integration

This API route stores contact form submissions as private GitHub Gists.

## Setup Instructions

### Step 1: Create a GitHub Personal Access Token

1. **Go to GitHub Token Settings:**

   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate a New Token:**

   - Click **"Generate new token"** → **"Generate new token (classic)"**
   - Note: You may need to authenticate again

3. **Configure the Token:**

   - **Note:** Give it a descriptive name (e.g., "Portfolio Contact Form")
   - **Expiration:** Choose your preferred expiration (or "No expiration" for long-term use)
   - **Scopes:** ⚠️ **IMPORTANT** - Check the box for **`gist`** scope
     - This is located in the "Select scopes" section
     - Look for "gist" and check the checkbox
     - This scope allows creating gists
   - Scroll down and click **"Generate token"**

4. **Copy the Token:**
   - ⚠️ **Copy the token immediately** - you won't be able to see it again!
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Add Environment Variable (Local Development)

1. **Create `.env.local` file:**

   - In your project root (same folder as `package.json`)
   - Create a file named `.env.local`

2. **Add the token:**

   ```bash
   GITHUB_GIST_TOKEN=ghp_your_actual_token_here
   ```

   - Replace `ghp_your_actual_token_here` with your actual token
   - No quotes needed

3. **Restart your dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart it
   npm run dev
   ```
   - ⚠️ Environment variables are only loaded when the server starts!

### Step 3: Production Deployment (Vercel)

1. **Go to Vercel Project Settings:**

   - Open your project on Vercel
   - Go to **Settings** → **Environment Variables**

2. **Add the variable:**

   - **Key:** `GITHUB_GIST_TOKEN`
   - **Value:** Your GitHub token (paste the token)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **"Save"**

3. **Redeploy:**
   - Go to **Deployments** tab
   - Click the "⋯" menu on the latest deployment
   - Select **"Redeploy"**

## Troubleshooting

### Error: "Permission denied. Ensure your token has 'gist' scope."

**Solution:**

1. Your token exists but doesn't have the correct scope
2. Go back to https://github.com/settings/tokens
3. Find your token and click **"Edit"** (or delete and create a new one)
4. Make sure the **`gist`** checkbox is checked ✅
5. Save and update your `.env.local` with the new token
6. Restart your dev server

### Error: "Server configuration error: GitHub token not configured"

**Solution:**

1. Make sure `.env.local` exists in the project root
2. Check the file has exactly: `GITHUB_GIST_TOKEN=your_token`
3. Restart your dev server (environment variables load on startup)
4. Check for typos in the variable name (must be exactly `GITHUB_GIST_TOKEN`)

### Error: "Authentication failed. Please check your GitHub token."

**Solution:**

1. Your token might be invalid or expired
2. Generate a new token following Step 1 above
3. Update `.env.local` with the new token
4. Restart your dev server

## How It Works

- Each form submission creates a **private** GitHub Gist
- The gist contains a JSON file with the submission data (name, email, message, intent, timestamp)
- Gists are private by default to protect user data
- Each submission includes a timestamp for tracking
- You can view all submissions in your GitHub Gists: https://gist.github.com/

## API Endpoints

### POST `/api/contact`

Creates a new contact form submission and stores it as a GitHub Gist.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'm interested in working with you.",
  "intent": "project"
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Form submitted successfully",
  "gistId": "abc123def456",
  "gistUrl": "https://gist.github.com/username/abc123def456"
}
```

**Response (Error):**

```json
{
  "error": "Error message here"
}
```

---

### GET `/api/contact`

Retrieves a list of all contact form submissions stored as GitHub Gists.

**Query Parameters:**

- `limit` (optional): Maximum number of submissions to return (default: 50, max: 100)
- `intent` (optional): Filter submissions by intent type (`project`, `hiring`, `consulting`, `hi`)

**Example Requests:**

```
GET /api/contact
GET /api/contact?limit=20
GET /api/contact?intent=project
GET /api/contact?limit=30&intent=hiring
```

**Response (Success):**

```json
{
  "success": true,
  "count": 10,
  "total": 15,
  "gists": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Hello, I'm interested in working with you.",
      "intent": "project",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "gistId": "abc123def456",
      "gistUrl": "https://gist.github.com/username/abc123def456",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
    // ... more submissions
  ]
}
```

**Response (Error):**

```json
{
  "error": "Error message here"
}
```

**Notes:**

- Submissions are sorted by timestamp (newest first)
- Only gists created by the contact form are included (filtered by description)
- The `count` field shows the number of items returned (after limit)
- The `total` field shows the total number of contact form submissions found
