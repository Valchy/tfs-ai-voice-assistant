import { fetchAirtableRecords } from '../../airtable-utils';

/**
 * GET /api/airtable/get/clients
 *
 * Fetches all records from the 'Clients' table in Airtable
 */
export async function GET() {
	return fetchAirtableRecords('Clients', 'Failed to fetch clients data');
}
