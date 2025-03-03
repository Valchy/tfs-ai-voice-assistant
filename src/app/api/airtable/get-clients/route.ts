import { fetchAirtableRecords } from '../airtable-utils';

export async function GET() {
	return fetchAirtableRecords('Clients', 'Failed to fetch clients data');
}
