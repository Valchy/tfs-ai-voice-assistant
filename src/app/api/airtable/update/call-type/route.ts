import Airtable from 'airtable';
import { NextRequest, NextResponse } from 'next/server';

// Get Airtable credentials from environment variables
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

// Allowed call types based on the UI in the image
const ALLOWED_CALL_TYPES = ['No Action', 'Card Block', 'Card Unblock', 'Card Application', 'Inquiry', 'Fraud Alert'];

// Type definition for records
type CallRecord = {
	id: string;
	[key: string]: any;
};

/**
 * POST /api/airtable/update/call-type
 *
 * Updates the Call Type field for a record in the 'Call History' table in Airtable
 * The record is identified by its ID, which is passed in the request body
 * Requires basic authentication if configured
 */
export async function POST(request: NextRequest) {
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

		// Parse URL-encoded form data
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const callType = formData.get('callType')?.toString();

		// Validate required parameters
		if (!id) {
			return NextResponse.json(
				{
					success: false,
					error: 'Missing required parameter: "id" is required to identify the call record',
				},
				{ status: 400 },
			);
		}

		if (!callType) {
			return NextResponse.json(
				{
					success: false,
					error: 'Missing required parameter: "callType" is required for the update',
				},
				{ status: 400 },
			);
		}

		// Validate call type
		if (!ALLOWED_CALL_TYPES.includes(callType)) {
			return NextResponse.json(
				{
					success: false,
					error: `Invalid call type. Allowed values: ${ALLOWED_CALL_TYPES.join(', ')}`,
				},
				{ status: 400 },
			);
		}

		// Initialize Airtable
		const base = new Airtable({ apiKey }).base(baseId);

		try {
			// Update the record directly using the provided ID
			const updatedRecord = await base('Call History').update([
				{
					id,
					fields: {
						'Call Type': callType,
					},
				},
			]);

			// Transform the updated record to a more friendly format
			const call: CallRecord = {
				id: updatedRecord[0].id,
				...updatedRecord[0].fields,
			};

			// Return the updated record data
			return NextResponse.json(
				{
					success: true,
					data: call,
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
					error: updateError.message || 'Failed to update call record',
				},
				{ status: 500 },
			);
		}
	} catch (error: any) {
		console.error('Error updating call type:', error);

		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to update call type',
			},
			{ status: 500 },
		);
	}
}
