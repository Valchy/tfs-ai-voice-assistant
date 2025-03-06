import { createApiHandler, createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/api-utils';
import { NextRequest } from 'next/server';
import twilio from 'twilio';

// Create a new Twilio client using environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Handler function for the POST request
async function sendSmsHandler(request: NextRequest) {
	try {
		// Ensure Twilio credentials are available
		if (!accountSid || !authToken || !twilioPhoneNumber) {
			return createErrorResponse('Twilio credentials are not configured properly', 500);
		}

		// Create Twilio client
		const client = twilio(accountSid, authToken);

		// Parse the request body
		const body = await request.json();

		// Extract required parameters
		const { to, message } = body;

		// Validate required parameters
		if (!to) {
			return createErrorResponse('Missing required parameter: "to" phone number', 400);
		}

		if (!message) {
			return createErrorResponse('Missing required parameter: "message" content', 400);
		}

		// Send the SMS
		const smsResponse = await client.messages.create({
			body: message,
			from: twilioPhoneNumber,
			to,
		});

		// Return success response with SMS details
		return createSuccessResponse({
			message: 'SMS sent successfully',
			sid: smsResponse.sid,
			status: smsResponse.status,
			to: smsResponse.to,
			from: smsResponse.from,
			dateSent: smsResponse.dateCreated,
		});
	} catch (error: any) {
		console.error('Error sending SMS:', error);
		return handleApiError(error);
	}
}

// Apply rate limiting to the POST handler
// Using 'high' tier as SMS sending is a sensitive operation
export const POST = createApiHandler(sendSmsHandler);
