import { createApiHandler, createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/api-utils';
import Airtable from 'airtable';
import { NextRequest } from 'next/server';

// Get Airtable credentials from environment variables
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

// Client type definition with index signature
type ClientRecord = {
	id: string;
	[key: string]: any;
};

// Handler function for the GET request
async function getFieldHandler(request: NextRequest, { params }: { params: { field: string } }) {
	try {
		// Validate Airtable environment variables
		if (!apiKey || !baseId) {
			return createErrorResponse('Airtable environment variables are not properly configured', 500);
		}

		// Get phone number from URL parameter
		const url = new URL(request.url);
		const phoneNumber = url.searchParams.get('phone');
		const fieldParam = params.field;

		// Validate phone number parameter
		if (!phoneNumber) {
			return createErrorResponse('Missing required parameter: "phone" is required', 400);
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
			return createErrorResponse('No client found with the provided phone number', 404);
		}

		// Transform the client record to a more friendly format
		const client: ClientRecord = {
			id: records[0].id,
			...records[0].fields,
		};

		// If a specific field was requested, return only that field
		if (fieldParam && fieldParam in client) {
			return createSuccessResponse(client[fieldParam]);
		}

		// Return the full client data
		return createSuccessResponse(client);
	} catch (error: any) {
		console.error('Error retrieving client:', error);
		return handleApiError(error);
	}
}

// Export the handler with rate limiting applied
// Using the 'low' tier since this is a read operation
export const GET = createApiHandler(getFieldHandler, {
	rateLimitTier: 'low',
});
