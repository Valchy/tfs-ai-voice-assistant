import { fetchAirtableRecords } from '../../airtable-utils';

/**
 * GET /api/airtable/get/cards
 *
 * Fetches all records from the 'Cards' table in Airtable
 */
export async function GET() {
	return fetchAirtableRecords('Cards', 'Failed to fetch cards data');
}
