import Airtable from 'airtable';
import { NextRequest, NextResponse } from 'next/server';

// Get Airtable credentials from environment variables
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

// Allowed status values for the cards
const ALLOWED_STATUSES = ['Active', 'Blocked', 'Frozen'];

// Type definition for Card record
type CardRecord = {
	id: string;
	[key: string]: any;
};

/**
 * POST /api/airtable/update/card/[cardNumber]
 *
 * Updates the status of a card in the 'Cards' table in Airtable
 * The card is identified by its card number from the URL path
 * The new status is provided in the URL-encoded body
 * Basic authentication is used if configured
 */
export async function POST(request: NextRequest, { params }: { params: { cardNumber: string } }) {
	try {
		// Get the card number from route parameters
		const { cardNumber } = params;

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

		// Parse URL-encoded form data
		const formData = await request.formData();
		const status = formData.get('status')?.toString();

		// Validate required parameters
		if (!cardNumber) {
			return NextResponse.json(
				{
					success: false,
					error: 'Missing required parameter: Card number is required to identify the card',
				},
				{ status: 400 },
			);
		}

		if (!status) {
			return NextResponse.json(
				{
					success: false,
					error: 'Missing required parameter: "status" is required for the update',
				},
				{ status: 400 },
			);
		}

		// Validate status
		if (!ALLOWED_STATUSES.includes(status)) {
			return NextResponse.json(
				{
					success: false,
					error: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`,
				},
				{ status: 400 },
			);
		}

		// Initialize Airtable
		const base = new Airtable({ apiKey }).base(baseId);

		// Clean the card number - remove any spaces or dashes
		const cleanCardNumber = cardNumber.replace(/[\s-]/g, '');

		// Find the card record with the matching card number
		const records = await base('Cards')
			.select({
				filterByFormula: `{Card Number} = "${cleanCardNumber}"`,
				maxRecords: 1,
			})
			.all();

		// Check if a card was found
		if (records.length === 0) {
			return NextResponse.json(
				{
					success: false,
					error: 'No card found with the provided card number',
				},
				{ status: 404 },
			);
		}

		// Get the record ID
		const recordId = records[0].id;

		// Update the record with the new status
		try {
			const updatedRecord = await base('Cards').update([
				{
					id: recordId,
					fields: {
						Status: status,
					},
				},
			]);

			// Transform the updated record to a more friendly format
			const card: CardRecord = {
				id: updatedRecord[0].id,
				...updatedRecord[0].fields,
			};

			// Return the updated card data
			return NextResponse.json(
				{
					success: true,
					data: card,
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
					error: updateError.message || 'Failed to update card record',
				},
				{ status: 500 },
			);
		}
	} catch (error: any) {
		console.error('Error updating card status:', error);

		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to update card status',
			},
			{ status: 500 },
		);
	}
}
