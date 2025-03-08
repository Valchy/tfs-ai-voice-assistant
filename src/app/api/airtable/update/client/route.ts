import Airtable from 'airtable';
import { NextRequest, NextResponse } from 'next/server';

// Get Airtable credentials from environment variables
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

// Get auth credentials from environment variables
const AUTH_USERNAME = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME;
const AUTH_PASSWORD = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD;

// Function to validate credentials
function isValidAuth(username: string | null, password: string | null): boolean {
	if (!AUTH_USERNAME || !AUTH_PASSWORD) {
		console.error('Auth credentials not configured in environment variables');
		return true; // Allow access if auth is not configured
	}

	return username === AUTH_USERNAME && password === AUTH_PASSWORD;
}

// Client type definition with index signature for TS safety
type ClientRecord = {
	id: string;
	[key: string]: any;
};

/**
 * Handle the client update logic (used by both PUT and POST handlers)
 */
async function handleClientUpdate(request: NextRequest) {
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

		// Parse raw JSON data
		const jsonData = await request.json();

		// Case-insensitive search for phone field
		const phone = jsonData.Phone || jsonData.phone;

		// Validate phone number presence
		if (!phone) {
			return NextResponse.json(
				{
					success: false,
					error: 'Phone number is required to identify the client',
				},
				{ status: 400 },
			);
		}

		// Format the phone number to search - keep only digits
		const formattedPhoneNumber = phone.toString().replace(/\D/g, '');

		// Extract all fields to update the client
		const fields: Record<string, any> = { ...jsonData };

		// Check if there are fields to update
		if (Object.keys(fields).length === 0) {
			return NextResponse.json(
				{
					success: false,
					error: 'No fields provided for update',
				},
				{ status: 400 },
			);
		}

		// Initialize Airtable
		const base = new Airtable({ apiKey }).base(baseId);

		// Find the client record with the matching phone number
		const existingRecords = await base('Clients')
			.select({
				filterByFormula: `OR(
          SUBSTITUTE(Phone, "-", "") = "${formattedPhoneNumber}",
          SUBSTITUTE(SUBSTITUTE(Phone, "+", ""), "-", "") = "${formattedPhoneNumber}"
        )`,
				maxRecords: 1,
			})
			.all();

		// Check if a client was found
		if (existingRecords.length === 0) {
			return NextResponse.json(
				{
					success: false,
					error: 'No client found with the provided phone number',
				},
				{ status: 404 },
			);
		}

		// Get the record ID
		const recordId = existingRecords[0].id;

		// Update the record with all provided fields
		try {
			const updatedRecord = await base('Clients').update([
				{
					id: recordId,
					fields: fields,
				},
			]);

			// Transform the updated record to a more friendly format
			const client: ClientRecord = {
				id: updatedRecord[0].id,
				...updatedRecord[0].fields,
			};

			// Return the updated client data
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
		} catch (updateError: any) {
			console.error('Error updating Airtable record:', updateError);
			return NextResponse.json(
				{
					success: false,
					error: updateError.message || 'Failed to update client record',
				},
				{ status: 500 },
			);
		}
	} catch (error: any) {
		console.error('Error updating client:', error);

		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to update client',
			},
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/airtable/update/client
 *
 * Updates a client record in the Airtable 'Clients' table
 * Client is identified by phone number from the JSON body
 * All fields provided in the JSON will be updated
 *
 * Accepts raw JSON data
 */
export async function PUT(request: NextRequest) {
	return handleClientUpdate(request);
}

/**
 * POST /api/airtable/update/client
 *
 * Alternative to PUT for clients that don't support PUT requests
 * Functions identically to the PUT handler
 */
export async function POST(request: NextRequest) {
	return handleClientUpdate(request);
}
