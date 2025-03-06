# API Rate Limiting Documentation

This document describes the rate limiting implementation for the API endpoints.

## Overview

The application uses a lightweight in-memory rate limiting solution to protect API endpoints from abuse. This implementation:

-   Provides tiered rate limiting based on endpoint type
-   Applies rate limiting at both the middleware level and individual route level
-   Is easy to configure and extend

## Rate Limit Tiers

The system defines three tiers of rate limiting:

| Tier     | Limit | Window   | Description                                      |
| -------- | ----- | -------- | ------------------------------------------------ |
| `low`    | 30    | 1 minute | For read operations and less sensitive endpoints |
| `medium` | 15    | 1 minute | Default tier for most API endpoints              |
| `high`   | 5     | 1 minute | For write operations and sensitive endpoints     |

## Implementation

### Middleware-level Rate Limiting

The global middleware automatically applies rate limiting to all API routes based on the endpoint path pattern:

-   `/api/twilio/webhook/*` and `/api/airtable/add/caller/*` → `low` tier (external services)
-   `/api/*/get/*` → `medium` tier (read operations)
-   All other API routes → `high` tier (write operations)

### Route-level Rate Limiting

Individual API routes can also apply rate limiting using the `createApiHandler` utility:

```typescript
// Example for a GET endpoint
export const GET = createApiHandler(myHandlerFunction, {
	rateLimitTier: 'low',
	rateLimit: true, // can be set to false to disable
});
```

## Rate Limit Response

When a rate limit is exceeded, the API returns a standard 429 (Too Many Requests) response:

```json
{
	"success": false,
	"error": "Too many requests",
	"limit": 15,
	"remaining": 0,
	"reset": "2023-06-15T12:30:45.000Z"
}
```

The response includes standard rate limiting headers:

-   `X-RateLimit-Limit`
-   `X-RateLimit-Remaining`
-   `X-RateLimit-Reset`
-   `Retry-After`

## Memory Considerations

Since this implementation uses in-memory storage, the rate limit counters will reset when the server restarts. This is suitable for smaller applications, but for production environments with multiple server instances, consider implementing a distributed rate limiting solution using Redis or similar technology.

## How to Use

### Creating a New API Route

```typescript
import { createApiHandler, createSuccessResponse } from '@/lib/api-utils';

// Define your handler function
async function myHandler(req, context) {
	// Handler implementation
	return createSuccessResponse({ message: 'Success' });
}

// Export with rate limiting
export const GET = createApiHandler(myHandler, {
	rateLimitTier: 'medium',
});
```

### Updating an Existing API Route

Convert your route to use the API utilities:

```typescript
// Before
export async function GET(req) {
	// Implementation
	return NextResponse.json({ data });
}

// After
async function getHandler(req) {
	// Implementation
	return createSuccessResponse(data);
}

export const GET = createApiHandler(getHandler, {
	rateLimitTier: 'low',
});
```

## Best Practices

1. Use appropriate rate limit tiers based on the endpoint's purpose
2. Apply stricter limits to write operations and sensitive endpoints
3. Use more lenient limits for public read operations
4. For high-traffic applications, consider implementing a distributed solution
5. Monitor rate limit hits to identify potential abuse or performance issues
