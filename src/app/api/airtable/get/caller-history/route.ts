import { createApiHandler, createSuccessResponse, handleApiError } from '@/lib/api-utils';
import { fetchAirtableRecords } from '../../airtable-utils';

export const dynamic = 'force-dynamic'; // This prevents Edge and Vercel from caching

// Handler function for GET requests
async function getCallerHistoryHandler() {
	try {
		// Add a unique identifier to the request for detailed logging
		const requestId = Math.random().toString(36).substring(2, 9);
		console.log(`[${requestId}] Processing caller history request`);

		const response = await fetchAirtableRecords('Call History', 'Failed to fetch caller history');

		// Parse the response body to extract data
		const data = await response.json();
		console.log(`[${requestId}] Caller history: retrieved ${data.data?.length || 0} records`);

		// Return the data using our standard success response format
		return createSuccessResponse(data.data || []);
	} catch (error) {
		console.error('Error fetching caller history:', error);
		return handleApiError(error);
	}
}

// Apply rate limiting to the GET handler
// Using 'low' tier as this is a read-only operation
export const GET = createApiHandler(getCallerHistoryHandler);
