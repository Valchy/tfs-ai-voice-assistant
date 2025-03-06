import { NextRequest, NextResponse } from 'next/server';

/**
 * Type for API route handlers that can include route parameters
 */
export type ApiHandler = (req: NextRequest, context?: any) => Promise<NextResponse> | NextResponse;

/**
 * Creates an API route handler
 * Simplified function that directly returns the handler
 *
 * @param handler The route handler function
 * @returns The same handler function, unchanged
 */
export function createApiHandler(handler: ApiHandler): ApiHandler {
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
