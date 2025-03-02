import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
	// Get the Authorization header from the request
	const authHeader = request.headers.get('Authorization');

	// If there's no Authorization header or it doesn't start with "Basic ", return a 401
	if (!authHeader || !authHeader.startsWith('Basic ')) {
		return new NextResponse('Authentication required', {
			status: 401,
			headers: {
				'WWW-Authenticate': 'Basic realm="Secure Area"',
			},
		});
	}

	// Decode the base64-encoded credentials
	const base64Credentials = authHeader.split(' ')[1];
	const credentials = atob(base64Credentials);
	const [username, password] = credentials.split(':');

	// Get auth credentials from environment variables
	const expectedUsername = process.env.BASIC_AUTH_USERNAME || '';
	const expectedPassword = process.env.BASIC_AUTH_PASSWORD || '';

	// Check if the credentials are valid
	if (username !== expectedUsername || password !== expectedPassword) {
		return new NextResponse('Invalid credentials', {
			status: 401,
			headers: {
				'WWW-Authenticate': 'Basic realm="Secure Area"',
			},
		});
	}

	// If the credentials are valid, continue with the request
	return NextResponse.next();
}

// Configure the middleware to run on all routes
export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
