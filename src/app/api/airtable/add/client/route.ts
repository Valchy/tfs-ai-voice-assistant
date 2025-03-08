import Airtable from 'airtable';
import { NextRequest, NextResponse } from 'next/server';

// Get Airtable credentials from environment variables
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

/**
 * POST /api/airtable/add/client
 *
 * Checks if a client exists by phone number, returns client data if found,
 * otherwise adds a new client to the 'Clients' table in Airtable
 *
 * Accepts URL-encoded form data
 */
export async function POST(request: NextRequest) {
	try {
		// Validate Airtable environment variables
		if (!apiKey || !baseId) {
			throw new Error('Airtable environment variables are not properly configured');
		}

		// Initialize Airtable
		const base = new Airtable({ apiKey }).base(baseId);

		// Parse URL-encoded form data
		const formData = await request.formData();
		const phone = formData.get('phone')?.toString();

		// Validate phone number presence
		if (!phone) {
			return NextResponse.json(
				{
					success: false,
					error: 'Phone number is required',
				},
				{
					status: 400,
					headers: {
						'Cache-Control': 'no-store, max-age=0, must-revalidate',
					},
				},
			);
		}

		// Format the phone number to search - keep only digits
		const formattedPhoneNumber = phone.replace(/\D/g, '');

		console.log('Checking for client with phone:', phone, '=>', formattedPhoneNumber);

		// Check if client already exists
		const existingRecords = await base('Clients')
			.select({
				filterByFormula: `OR(
          SUBSTITUTE(Phone, "-", "") = "${formattedPhoneNumber}",
          SUBSTITUTE(SUBSTITUTE(Phone, "+", ""), "-", "") = "${formattedPhoneNumber}"
        )`,
			})
			.all();

		// If client exists, return their data
		if (existingRecords.length > 0) {
			const existingClient = existingRecords.map(record => ({
				id: record.id,
				...record.fields,
			}));

			return NextResponse.json(
				{
					success: true,
					exists: true,
					data: existingClient,
				},
				{
					headers: {
						'Cache-Control': 'no-store, max-age=0, must-revalidate',
					},
				},
			);
		}

		// Create new client record
		const createdRecord = await base('Clients').create({
			Phone: phone,
		});

		// Return the newly created client data
		return NextResponse.json(
			{
				success: true,
				exists: false,
				data: {
					id: createdRecord.id,
					...createdRecord.fields,
				},
			},
			{
				status: 201, // Created
				headers: {
					'Cache-Control': 'no-store, max-age=0, must-revalidate',
				},
			},
		);
	} catch (error) {
		console.error('Error adding/checking client:', error);
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to process client data',
			},
			{
				status: 500,
				headers: {
					'Cache-Control': 'no-store, max-age=0, must-revalidate',
				},
			},
		);
	}
}
