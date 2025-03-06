import { NextRequest, NextResponse } from 'next/server';

// Types for rate limit configuration
export type RateLimitTier = 'low' | 'medium' | 'high';

// Interfaces
interface RateLimitConfig {
	limit: number;
	windowMs: number;
}

interface RateLimitRecord {
	timestamp: number;
	count: number;
}

// Configure rate limit tiers
const RATE_LIMIT_CONFIGS: Record<RateLimitTier, RateLimitConfig> = {
	low: { limit: 60, windowMs: 60 * 1000 }, // 60 requests per minute
	medium: { limit: 30, windowMs: 60 * 1000 }, // 30 requests per minute
	high: { limit: 10, windowMs: 60 * 1000 }, // 10 requests per minute
};

// In-memory store for rate limiting
// Note: This will reset when the server restarts
// For production, consider using a more persistent solution like Redis
const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up old rate limit records periodically
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes
setInterval(() => {
	const now = Date.now();

	// Find the highest window time to ensure all tiers are respected
	const maxWindowMs = Math.max(...Object.values(RATE_LIMIT_CONFIGS).map(config => config.windowMs));

	// Use Array.from to convert Map entries to array for iteration
	Array.from(rateLimitStore.entries()).forEach(([key, record]) => {
		if (now - record.timestamp > maxWindowMs) {
			rateLimitStore.delete(key);
		}
	});
}, CLEANUP_INTERVAL);

/**
 * Rate limit middleware function
 *
 * @param request NextRequest object
 * @param tier Rate limit tier to apply
 * @param customKey Optional custom identifier (defaults to IP)
 * @returns NextResponse if rate limit is exceeded, null otherwise
 */
export async function rateLimit(request: NextRequest, tier: RateLimitTier = 'medium', customKey?: string): Promise<NextResponse | null> {
	try {
		// Get the IP address or use a custom key
		const ip = request.ip || 'anonymous';
		const key = `${customKey || ip}:${tier}`;

		// Get the configuration for the specified tier
		const config = RATE_LIMIT_CONFIGS[tier];
		const { limit, windowMs } = config;

		// Get current timestamp
		const now = Date.now();

		// Get existing record or create new one
		const record = rateLimitStore.get(key) || { timestamp: now, count: 0 };

		// Reset count if window has passed
		if (now - record.timestamp > windowMs) {
			record.timestamp = now;
			record.count = 0;
		}

		// Increment count
		record.count++;

		// Update record in store
		rateLimitStore.set(key, record);

		// Check if rate limit is exceeded
		if (record.count > limit) {
			const resetTime = new Date(record.timestamp + windowMs);

			// Return error response with appropriate headers
			return new NextResponse(
				JSON.stringify({
					success: false,
					error: 'Too many requests',
					limit,
					remaining: 0,
					reset: resetTime.toISOString(),
				}),
				{
					status: 429,
					headers: {
						'Content-Type': 'application/json',
						'X-RateLimit-Limit': limit.toString(),
						'X-RateLimit-Remaining': '0',
						'X-RateLimit-Reset': resetTime.toISOString(),
						'Retry-After': Math.ceil((record.timestamp + windowMs - now) / 1000).toString(),
					},
				},
			);
		}

		// Not rate limited
		return null;
	} catch (error) {
		// Log error but don't block the request
		console.error('Rate limiting error:', error);
		return null;
	}
}

/**
 * Higher-order function to apply rate limiting to any API handler
 *
 * @param handler The API handler function
 * @param tier Rate limit tier to apply
 * @returns A wrapped handler with rate limiting applied
 */
export function withRateLimit(handler: (req: NextRequest) => Promise<NextResponse> | NextResponse, tier: RateLimitTier = 'medium') {
	return async (req: NextRequest) => {
		// Apply rate limiting
		const limiterResponse = await rateLimit(req, tier);

		// If rate limited, return the error response
		if (limiterResponse) {
			return limiterResponse;
		}

		// Otherwise, proceed with the handler
		return handler(req);
	};
}
