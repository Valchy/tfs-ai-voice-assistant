import Airtable from 'airtable';
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Create a new Twilio client using environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Get Airtable credentials from environment variables
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

// Client type definition with index signature
type ClientRecord = {
	id: string;
	[key: string]: any;
};

// GET method to retrieve a client by phone number
export async function GET(request: NextRequest) {
	try {
		// Validate Airtable environment variables
		if (!apiKey || !baseId) {
			return NextResponse.json(
				{
					success: false,
					error: 'Airtable environment variables are not properly configured',
				},
				{ status: 500 },
			);
		}

		// Get phone number from URL parameter
		const url = new URL(request.url);
		const phoneNumber = url.searchParams.get('phone');
		const fieldParam = url.searchParams.get('field');

		// Validate phone number parameter
		if (!phoneNumber) {
			return NextResponse.json(
				{
					success: false,
					error: 'Missing required parameter: "phone" is required',
				},
				{ status: 400 },
			);
		}

		// Initialize Airtable
		const base = new Airtable({ apiKey }).base(baseId);

		// Fetch client with matching phone number
		const records = await base('Clients')
			.select({
				filterByFormula: `{Phone} = "${phoneNumber}"`,
				maxRecords: 1,
			})
			.all();

		// Check if a client was found
		if (records.length === 0) {
			return NextResponse.json(
				{
					success: false,
					error: 'No client found with the provided phone number',
				},
				{ status: 404 },
			);
		}

		// Transform the client record to a more friendly format
		const client: ClientRecord = {
			id: records[0].id,
			...records[0].fields,
		};

		// If a specific field was requested, return only that field
		if (fieldParam && fieldParam in client) {
			return NextResponse.json(
				{
					success: true,
					data: client[fieldParam],
				},
				{
					headers: {
						'Cache-Control': 'no-store, max-age=0, must-revalidate',
					},
				},
			);
		}

		// Return the client with cache control headers
		return NextResponse.json(
			{
				success: true,
				data: client,
			},
			{
				headers: {
					'Cache-Control': 'no-store, max-age=0, must-revalidate',
				},
			},
		);
	} catch (error: any) {
		console.error('Error retrieving client:', error);

		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to retrieve client',
			},
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
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
