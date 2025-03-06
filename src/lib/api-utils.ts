import { NextRequest, NextResponse } from 'next/server';
import { RateLimitTier, withRateLimit } from './rate-limit';

/**
 * Type for API route handlers that can include route parameters
 */
export type ApiHandler = (req: NextRequest, context?: any) => Promise<NextResponse> | NextResponse;

/**
 * Options for creating API route handlers
 */
export interface ApiHandlerOptions {
	/**
	 * Enable rate limiting for this handler
	 * @default true
	 */
	rateLimit?: boolean;

	/**
	 * Rate limit tier to use (low, medium, high)
	 * @default 'medium'
	 */
	rateLimitTier?: RateLimitTier;
}

/**
 * Creates an API route handler with optional rate limiting
 *
 * @param handler The route handler function
 * @param options Configuration options
 * @returns A Next.js API route handler
 */
export function createApiHandler(handler: ApiHandler, options: ApiHandlerOptions = {}): ApiHandler {
	// Default options
	const { rateLimit = true, rateLimitTier = 'medium' } = options;

	// Apply rate limiting if enabled
	if (rateLimit) {
		// We need to preserve the context parameter when wrapping the handler
		return async (req: NextRequest, context?: any) => {
			const limiterResponse = await withRateLimit(request => handler(request, context), rateLimitTier)(req);

			return limiterResponse;
		};
	}

	// Otherwise return the handler as is
	return handler;
}

/**
 * Creates a standard error response
 *
 * @param message Error message
 * @param status HTTP status code
 * @returns NextResponse with error details
 */
export function createErrorResponse(message: string, status = 400): NextResponse {
	return NextResponse.json(
		{
			success: false,
			error: message,
		},
		{
			status,
			headers: {
				'Cache-Control': 'no-store, max-age=0, must-revalidate',
				'Pragma': 'no-cache',
				'Expires': '0',
			},
		},
	);
}

/**
 * Creates a standard success response
 *
 * @param data Response data
 * @param status HTTP status code
 * @returns NextResponse with success data
 */
export function createSuccessResponse(data: any, status = 200): NextResponse {
	return NextResponse.json(
		{
			success: true,
			data,
		},
		{
			status,
			headers: {
				'Cache-Control': 'no-store, max-age=0, must-revalidate',
				'Pragma': 'no-cache',
				'Expires': '0',
			},
		},
	);
}

/**
 * Safely handles API errors and returns a consistent error response
 *
 * @param error The caught error
 * @returns NextResponse with error details
 */
export function handleApiError(error: unknown): NextResponse {
	console.error('API Error:', error);

	// Handle specific error types
	if (error instanceof Error) {
		return createErrorResponse(error.message, 500);
	}

	// Generic error handling
	return createErrorResponse('An unexpected error occurred', 500);
}
