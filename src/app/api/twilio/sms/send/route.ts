import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Create a new Twilio client using environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Basic auth credentials
const AUTH_USERNAME = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME || '';
const AUTH_PASSWORD = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD || '';

export async function POST(request: NextRequest) {
	try {
		// Get authentication from query parameters
		const searchParams = request.nextUrl.searchParams;
		const username = searchParams.get('username');
		const password = searchParams.get('password');

		// Check authentication if credentials are configured
		if (AUTH_USERNAME && AUTH_PASSWORD) {
			if (!username || !password || username !== AUTH_USERNAME || password !== AUTH_PASSWORD) {
				return NextResponse.json(
					{
						success: false,
						error: 'Invalid authentication credentials',
					},
					{ status: 401 },
				);
			}
		}

		// Ensure Twilio credentials are available
		if (!accountSid || !authToken || !twilioPhoneNumber) {
			return NextResponse.json(
				{
					success: false,
					error: 'Twilio credentials are not configured properly',
				},
				{ status: 500 },
			);
		}

		// Create Twilio client
		const client = twilio(accountSid, authToken);

		// Parse the request body
		const body = await request.json();

		// Extract required parameters
		const { to, message } = body;

		// Validate required parameters
		if (!to || !message) {
			return NextResponse.json(
				{
					success: false,
					error: 'Missing required parameters: "to" (phone number) and "message" are required',
				},
				{ status: 400 },
			);
		}

		// Send the SMS
		const result = await client.messages.create({
			body: message,
			from: twilioPhoneNumber,
			to: to,
		});

		// Return success response with message details
		return NextResponse.json({
			success: true,
			messageId: result.sid,
			status: result.status,
		});
	} catch (error: any) {
		console.error('Error sending SMS:', error);

		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to send SMS',
			},
			{ status: 500 },
		);
	}
}
