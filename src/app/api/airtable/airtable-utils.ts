import Airtable from 'airtable';
import { NextResponse } from 'next/server';

/**
 * Fetches records from an Airtable table
 * @param tableName The name of the table to fetch data from
 * @param errorMessage The error message to return if the fetch fails
 * @returns NextResponse with the fetched data
 */
export async function fetchAirtableRecords(tableName: string, errorMessage: string = 'Failed to fetch data') {
	try {
		// Get Airtable credentials from environment variables
		const apiKey = process.env.AIRTABLE_API_KEY;
		const baseId = process.env.AIRTABLE_BASE_ID;

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
		const data = records.map(record => {
			return {
				id: record.id,
				...record.fields,
			};
		});

		// Return the records
		return NextResponse.json({
			success: true,
			data: data,
		});
	} catch (error) {
		console.error(`Error fetching data from Airtable table ${tableName}:`, error);
		return NextResponse.json(
			{
				success: false,
				error: errorMessage,
			},
			{ status: 500 },
		);
	}
}
