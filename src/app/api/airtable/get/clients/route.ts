import { createApiHandler, createSuccessResponse, handleApiError } from '@/lib/api-utils';
import { fetchAirtableRecords } from '../../airtable-utils';

export const dynamic = 'force-dynamic'; // This prevents Edge and Vercel from caching

// Handler function for GET requests
async function getClientsHandler() {
	try {
		const response = await fetchAirtableRecords('Clients', 'Failed to fetch clients data');

		// Parse the response body to get data
		const data = await response.json();

		// Return data with our standard response format and cache control headers
		return createSuccessResponse(data.data || []);
	} catch (error) {
		console.error('Error fetching clients:', error);
		return handleApiError(error);
	}
}

// Apply rate limiting to the GET handler with 'low' tier since this is a read-only operation
export const GET = createApiHandler(getClientsHandler, {
	rateLimitTier: 'low',
});
