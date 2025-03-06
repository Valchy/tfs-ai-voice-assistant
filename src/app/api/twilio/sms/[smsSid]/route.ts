import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Create a new Twilio client using environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

export async function GET(request: NextRequest, { params }: { params: { smsSid: string } }) {
	try {
		// Get SMS SID from the route parameters
		const { smsSid } = params;

		// Ensure Twilio credentials are available
		if (!accountSid || !authToken) {
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

		// Fetch the SMS message
		const message = await client.messages(smsSid).fetch();

		// Return the SMS text content as plain text
		return new NextResponse(message.body, {
			status: 200,
			headers: {
				'Content-Type': 'text/plain',
			},
		});
	} catch (error: any) {
		console.error('Error retrieving SMS:', error);

		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to retrieve SMS',
			},
			{ status: 500 },
		);
	}
}
