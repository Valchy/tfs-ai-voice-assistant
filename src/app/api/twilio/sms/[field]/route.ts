import Airtable from 'airtable';
import { NextRequest, NextResponse } from 'next/server';

// Get Airtable credentials from environment variables
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

// Client type definition with index signature for TS safety
type ClientRecord = {
	id: string;
	[key: string]: any;
};

export async function POST(request: NextRequest, { params }: { params: { field: string } }) {
	try {
		// Get the field from route parameters
		const { field } = params;

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

		// Parse the request body
		const body = await request.json();

		// Extract required parameters
		const { phone, value } = body;

		// Validate required parameters
		if (!phone) {
			return NextResponse.json(
				{
					success: false,
					error: 'Missing required parameter: "phone" is required to identify the client',
				},
				{ status: 400 },
			);
		}

		if (value === undefined) {
			return NextResponse.json(
				{
					success: false,
					error: 'Missing required parameter: "value" is required for the update',
				},
				{ status: 400 },
			);
		}

		// Initialize Airtable
		const base = new Airtable({ apiKey }).base(baseId);

		// Find the client record with the matching phone number
		const records = await base('Clients')
			.select({
				filterByFormula: `{Phone} = "${phone}"`,
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

		// Get the record ID
		const recordId = records[0].id;

		// Update the record with the new field value
		try {
			const updatedRecord = await base('Clients').update([
				{
					id: recordId,
					fields: {
						[field]: value,
					},
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
