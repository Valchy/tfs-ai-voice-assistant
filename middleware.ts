import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// This function runs for every request to add cache control headers
export function middleware(request: NextRequest) {
	// Get the response
	const response = NextResponse.next();

	// Add cache control headers to prevent caching
	response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
	response.headers.set('Pragma', 'no-cache');
	response.headers.set('Expires', '0');

	return response;
}

// Apply only to API routes
export const config = {
	matcher: '/api/:path*',
};
