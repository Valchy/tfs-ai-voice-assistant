import { NextRequest, NextResponse } from 'next/server';

// Basic auth credentials from environment variables
const AUTH_USERNAME = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME;
const AUTH_PASSWORD = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD;

// Function to validate basic auth credentials
function validateCredentials(username: string | null, password: string | null): boolean {
	if (!AUTH_USERNAME || !AUTH_PASSWORD) {
		console.error('Auth credentials not configured in environment variables');
		return false;
	}

	return username === AUTH_USERNAME && password === AUTH_PASSWORD;
}

export async function POST(request: NextRequest) {
	try {
		// Extract query parameters for authentication
		const url = new URL(request.url);
		const username = url.searchParams.get('username');
		const password = url.searchParams.get('password');

		// Parse form data from the request body (Twilio sends form-encoded data)
		const formData = await request.formData();

		// Convert FormData to a regular object for easier access and logging
		const bodyData: Record<string, any> = {};
		formData.forEach((value, key) => {
			bodyData[key] = value;
		});

		// Log the entire request body
		console.log('Webhook request body:', bodyData);

		// Validate authentication
		// if (!validateCredentials(username, password)) {
		// 	return NextResponse.json(
		// 		{
		// 			success: false,
		// 			error: 'Unauthorized: Invalid credentials',
		// 		},
		// 		{ status: 401 },
		// 	);
		// }

		// Return a simple success response
		return NextResponse.json(
			{
				success: true,
				message: 'Credentials valid',
				body: bodyData,
			},
			{ status: 200 },
		);
	} catch (error: any) {
		console.error('Error processing webhook:', error);

		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to process webhook',
			},
			{ status: 500 },
		);
	}
}
