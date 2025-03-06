import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { rateLimit, RateLimitTier } from './lib/rate-limit';

// This function runs for every request to handle authentication and cache control
export async function middleware(request: NextRequest) {
	// Apply rate limiting for API routes
	if (request.nextUrl.pathname.startsWith('/api/')) {
		// Define rate limit tier based on the endpoint
		let tier: RateLimitTier = 'medium';

		// Determine the appropriate rate limit tier based on the endpoint type
		if (request.nextUrl.pathname.startsWith('/api/twilio/webhook') || request.nextUrl.pathname.startsWith('/api/airtable/add/caller')) {
			// Low rate limiting for webhook endpoints that are called by external services
			tier = 'low';
		} else if (request.nextUrl.pathname.includes('/get/')) {
			// Medium tier for read operations
			tier = 'medium';
		} else {
			// High tier for write operations (more strict)
			tier = 'high';
		}

		// Apply rate limiting - if limit exceeded, return the error response
		const rateLimitResponse = await rateLimit(request, tier);
		if (rateLimitResponse) {
			return rateLimitResponse;
		}
	}

	// Skip authentication for the Twilio webhook endpoint
	// as it handles its own authentication via query parameters
	if (request.nextUrl.pathname.startsWith('/api/twilio/webhook') || request.nextUrl.pathname.startsWith('/api/airtable/add/caller')) {
		const response = NextResponse.next();

		// Add cache control headers
		response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');

		return response;
	}

	// Get the Authorization header from the request
	const authHeader = request.headers.get('Authorization');

	// Get auth credentials from environment variables
	const expectedUsername = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME || '';
	const expectedPassword = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD || '';

	// Only check auth if credentials are set (to prevent locking ourselves out)
	if (expectedUsername && expectedPassword) {
		// If there's no Authorization header or it doesn't start with "Basic ", return a 401
		if (!authHeader || !authHeader.startsWith('Basic ')) {
			return new NextResponse('Authentication required', {
				status: 401,
				headers: {
					'WWW-Authenticate': 'Basic realm="Secure Area"',
					'Cache-Control': 'no-store, max-age=0, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0',
				},
			});
		}

		// Decode the base64-encoded credentials
		const base64Credentials = authHeader.split(' ')[1];
		const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
		const [username, password] = credentials.split(':');

		// Check if the credentials are valid
		if (username !== expectedUsername || password !== expectedPassword) {
			return new NextResponse('Invalid credentials', {
				status: 401,
				headers: {
					'WWW-Authenticate': 'Basic realm="Secure Area"',
					'Cache-Control': 'no-store, max-age=0, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0',
				},
			});
		}
	}

	// Authentication passed or not required, continue with the request
	const response = NextResponse.next();

	// For API routes, add cache control headers
	if (request.nextUrl.pathname.startsWith('/api/')) {
		// Add cache control headers to prevent caching
		response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');
	}

	return response;
}

// Apply to all routes except static assets and images
export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
