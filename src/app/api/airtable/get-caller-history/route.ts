import { fetchAirtableRecords } from '../airtable-utils';

export async function GET() {
	return fetchAirtableRecords('Call History', 'Failed to fetch caller history');
}
