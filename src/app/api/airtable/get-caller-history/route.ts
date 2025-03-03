import { NextResponse } from 'next/server';
import { fetchAirtableRecords } from '../airtable-utils';

export const dynamic = 'force-dynamic'; // This prevents Edge and Vercel from caching

export async function GET() {
	const response = await fetchAirtableRecords('Call History', 'Failed to fetch caller history');

	// Clone the response to add cache control headers
	return new NextResponse(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: {
			...Object.fromEntries(response.headers),
			'Cache-Control': 'no-store, max-age=0, must-revalidate',
		},
	});
}
