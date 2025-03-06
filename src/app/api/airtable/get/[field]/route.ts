import Airtable from 'airtable';
import { NextRequest, NextResponse } from 'next/server';

// Get Airtable credentials from environment variables
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

// Client type definition with index signature
type ClientRecord = {
	id: string;
	[key: string]: any;
};

// GET method to retrieve a client by phone number
export async function GET(request: NextRequest, { params }: { params: { field: string } }) {
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
		const fieldParam = params.field;

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
