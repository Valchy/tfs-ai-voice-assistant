import { fetchAirtableRecords } from '../../airtable-utils';

/**
 * GET /api/airtable/get/caller-history
 *
 * Fetches all records from the 'Call History' table in Airtable
 */
export async function GET() {
	return fetchAirtableRecords('Call History', 'Failed to fetch caller history data');
}
