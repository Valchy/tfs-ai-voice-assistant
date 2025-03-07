import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Get auth credentials from environment variables
const BASIC_AUTH_USERNAME = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME || '';
const BASIC_AUTH_PASSWORD = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD || '';

// This function runs for every request to handle authentication and cache control
export function middleware(request: NextRequest) {
	// Skip authentication for the Twilio webhook endpoint
	// as it handles its own authentication via query parameters
	if (
		request.nextUrl.pathname.startsWith('/api/twilio') ||
		request.nextUrl.pathname.startsWith('/api/airtable/add/caller') ||
		request.nextUrl.pathname.match(/^\/api\/airtable\/get\/clients\/.*$/)
	) {
		const response = NextResponse.next();

		// Add cache control headers
		response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');

		return response;
	}

	// Get the Authorization header from the request
	const authHeader = request.headers.get('Authorization');

	// Only check auth if credentials are set (to prevent locking ourselves out)
	if (BASIC_AUTH_USERNAME && BASIC_AUTH_PASSWORD) {
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
		if (username !== BASIC_AUTH_USERNAME || password !== BASIC_AUTH_PASSWORD) {
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
