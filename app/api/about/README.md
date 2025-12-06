# About/Career Journey API - GitHub Gist Integration

This API route manages the career journey/about data stored as a private GitHub Gist. It provides CRUD operations for the `about-gist.json` file used by the `CareerJourneyParallax` component.

## Setup Instructions

### Prerequisites

This API uses the same `GITHUB_GIST_TOKEN` environment variable as the projects and contact APIs. If you've already set it up, you're good to go! If not, follow the setup instructions in `/api/contact/README.md`.

## API Endpoints

### GET `/api/about`

Retrieves the career journey data from the GitHub Gist.

**Response (Success - Gist Found):**

```json
{
  "found": true,
  "gistId": "abc123def456",
  "data": {
    "milestones": [
      {
        "era": "2016 - 2020",
        "title": "Origins",
        "description": "LD College of Engineering. Chemical Engineering basics...",
        "image": "https://images.unsplash.com/..."
      }
      // ... more milestones
    ]
  }
}
```

**Response (Gist Not Found):**

```json
{
  "found": false,
  "data": null
}
```

**Response (Error):**

```json
{
  "error": "Failed to fetch about data: Error message here"
}
```

---

### POST `/api/about`

Creates a new gist or updates an existing one with career journey data.

**Request Body:**

```json
{
  "data": {
    "milestones": [
      {
        "era": "2016 - 2020",
        "title": "Origins",
        "description": "LD College of Engineering. Chemical Engineering basics...",
        "image": "https://images.unsplash.com/..."
      }
      // ... more milestones
    ]
  },
  "gistId": "abc123def456" // Optional: include to update existing gist
}
```

**Response (Success - Created):**

```json
{
  "success": true,
  "gistId": "abc123def456",
  "message": "About data created successfully"
}
```

**Response (Success - Updated):**

```json
{
  "success": true,
  "gistId": "abc123def456",
  "message": "About data updated successfully"
}
```

**Response (Error):**

```json
{
  "error": "Failed to save: Error message here"
}
```

**Notes:**

- If `gistId` is provided, the existing gist will be updated (PATCH)
- If `gistId` is not provided, a new gist will be created (POST)
- The gist is stored as private by default
- The filename is always `about-gist.json`

---

### DELETE `/api/about`

Deletes the about gist from GitHub.

**Request Body:**

```json
{
  "gistId": "abc123def456"
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "About gist deleted successfully"
}
```

**Response (Error):**

```json
{
  "error": "Failed to delete: Error message here"
}
```

**⚠️ Warning:** This operation is permanent and cannot be undone. Use with caution.

---

## Usage Examples

### Fetching Career Journey Data

```typescript
const response = await fetch('/api/about');
const result = await response.json();

if (result.found) {
  console.log('Career milestones:', result.data);
} else {
  console.log('No gist found, using default data');
}
```

### Creating/Updating Career Journey Data

```typescript
const milestones = [
  {
    era: "2016 - 2020",
    title: "Origins",
    description: "LD College of Engineering...",
    image: "https://images.unsplash.com/..."
  },
  // ... more milestones
];

const response = await fetch('/api/about', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: { milestones },
    gistId: existingGistId, // Optional: omit to create new
  }),
});

const result = await response.json();
if (result.success) {
  console.log('Saved! Gist ID:', result.gistId);
}
```

### Deleting the Gist

```typescript
const response = await fetch('/api/about', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    gistId: 'abc123def456',
  }),
});

const result = await response.json();
if (result.success) {
  console.log('Gist deleted successfully');
}
```

## Data Structure

The expected data structure matches the `CareerMilestone` type from `CareerJourneyParallax.tsx`:

```typescript
type CareerMilestone = {
  era: string;        // e.g., "2016 - 2020"
  title: string;      // e.g., "Origins"
  description: string; // Full description text
  image: string;      // URL to image
};
```

## Integration with CareerJourneyParallax

To make the component fetch data from the API instead of using hardcoded data:

1. Add a `useEffect` hook to fetch data on mount
2. Update the `CAREER_MILESTONES` state based on API response
3. Fall back to default data if the gist is not found

Example:

```typescript
const [milestones, setMilestones] = useState(CAREER_MILESTONES);

useEffect(() => {
  fetch('/api/about')
    .then(res => res.json())
    .then(result => {
      if (result.found && result.data?.milestones) {
        setMilestones(result.data.milestones);
      }
    })
    .catch(console.error);
}, []);
```

## Troubleshooting

### Error: "Server configuration error: GitHub token not configured"

**Solution:** Make sure `GITHUB_GIST_TOKEN` is set in your `.env.local` file and restart your dev server.

### Error: "Permission denied. Ensure your token has 'gist' scope."

**Solution:** Your GitHub token needs the `gist` scope. Regenerate your token with the gist scope enabled.

### Error: "Gist not found"

**Solution:** The gist hasn't been created yet. Use POST `/api/about` to create it first.

