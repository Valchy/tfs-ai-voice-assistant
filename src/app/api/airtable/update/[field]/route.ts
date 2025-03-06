import { createApiHandler, createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/api-utils';
import Airtable from 'airtable';
import { NextRequest } from 'next/server';

// Get Airtable credentials from environment variables
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

// Client type definition with index signature for TS safety
type ClientRecord = {
	id: string;
	[key: string]: any;
};

// Handler function for the POST request
async function updateFieldHandler(request: NextRequest, { params }: { params: { field: string } }) {
	try {
		// Get the field from route parameters
		const { field } = params;

		// Validate Airtable environment variables
		if (!apiKey || !baseId) {
			return createErrorResponse('Airtable environment variables are not properly configured', 500);
		}

		// Get parameters from URL query instead of body
		const url = new URL(request.url);
		const phone = url.searchParams.get('phone');
		const value = url.searchParams.get('value');
		const nextField = url.searchParams.get('next_field'); // Optional

		// Validate required parameters
		if (!phone) {
			return createErrorResponse('Missing required parameter: "phone" is required', 400);
		}

		if (!value) {
			return createErrorResponse('Missing required parameter: "value" is required', 400);
		}

		// Initialize Airtable
		const base = new Airtable({ apiKey }).base(baseId);

		// Find the client with the given phone number
		const records = await base('Clients')
			.select({
				filterByFormula: `{Phone} = "${phone}"`,
				maxRecords: 1,
			})
			.all();

		// Check if a client was found
		if (records.length === 0) {
			return createErrorResponse('No client found with the provided phone number', 404);
		}

		// Get the client record
		const clientRecord = records[0];
		const clientData: ClientRecord = {
			id: clientRecord.id,
			...clientRecord.fields,
		};

		// Create the update object with the field to update
		const updateFields: Record<string, any> = {
			[field]: value,
		};

		// Update the NEXT_FIELD_UPDATE field if nextField is provided
		if (nextField) {
			updateFields.NEXT_FIELD_UPDATE = nextField;
		}

		// Update the client record in Airtable
		const updatedRecord = await base('Clients').update(clientData.id, updateFields);

		// Return success response with updated client data
		return createSuccessResponse({
			message: `Successfully updated ${field} field`,
			updated: {
				id: updatedRecord.id,
				...updatedRecord.fields,
			},
			originalValue: clientData[field],
			newValue: value,
			nextField: nextField || clientData.NEXT_FIELD_UPDATE,
		});
	} catch (error: any) {
		console.error(`Error updating ${params.field} field:`, error);
		return handleApiError(error);
	}
}

// Apply rate limiting to the POST handler
// Using 'high' tier as this is an update operation
export const POST = createApiHandler(updateFieldHandler, {
	rateLimitTier: 'high',
});
