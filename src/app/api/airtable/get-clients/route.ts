import Airtable from 'airtable';
import { NextResponse } from 'next/server';

// Configure Airtable
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;
const tableName = 'Clients';

export async function GET() {
	try {
		// Validate Airtable environment variables
		if (!apiKey || !baseId || !tableName) {
			throw new Error('Airtable environment variables are not properly configured');
		}

		// Initialize Airtable
		const base = new Airtable({ apiKey }).base(baseId);

		// Fetch all records from the table
		const records = await base(tableName)
			.select({
				// You can add view, filterByFormula, etc. here if needed
				// view: 'Grid view',
			})
			.all();

		// Transform the records to a more friendly format
		const callerHistory = records.map(record => {
			return {
				id: record.id,
				...record.fields,
			};
		});

		// Return the records
		return NextResponse.json({
			success: true,
			data: callerHistory,
		});
	} catch (error) {
		console.error('Error fetching data from Airtable:', error);
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch caller history',
			},
			{ status: 500 },
		);
	}
}
