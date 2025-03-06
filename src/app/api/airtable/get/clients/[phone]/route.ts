import Airtable from 'airtable';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/airtable/get/clients/{phone}
 *
 * Fetches a specific client by phone number from the 'Clients' table in Airtable
 * Authentication is done via query parameters (username and password)
 */
export async function GET(request: NextRequest, { params }: { params: { phone: string } }) {
	try {
		// Get the phone number from the URL parameter
		const { phone } = params;

		if (!phone) {
			return NextResponse.json(
				{
					success: false,
					error: 'Phone number is required',
				},
				{
					status: 400,
					headers: {
						'Cache-Control': 'no-store, max-age=0, must-revalidate',
					},
				},
			);
		}

		// Get username and password from query parameters
		const searchParams = request.nextUrl.searchParams;
		const username = searchParams.get('username');
		const password = searchParams.get('password');

		// Get expected credentials from environment variables
		const expectedUsername = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME || '';
		const expectedPassword = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD || '';

		// Validate credentials if environment variables are set
		if (expectedUsername && expectedPassword) {
			if (!username || !password || username !== expectedUsername || password !== expectedPassword) {
				return NextResponse.json(
					{
						success: false,
						error: 'Invalid credentials',
					},
					{
						status: 401,
						headers: {
							'Cache-Control': 'no-store, max-age=0, must-revalidate',
						},
					},
				);
			}
		}

		// Get Airtable credentials from environment variables
		const apiKey = process.env.AIRTABLE_API_KEY;
		const baseId = process.env.AIRTABLE_BASE_ID;

		// Validate Airtable environment variables
		if (!apiKey || !baseId) {
			throw new Error('Airtable environment variables are not properly configured');
		}

		// Initialize Airtable
		const base = new Airtable({ apiKey }).base(baseId);

		// Format the phone number to search (removing any non-digit characters)
		const formattedPhoneNumber = phone.replace(/\D/g, '');

		// Fetch records from the Clients table that match the phone number
		const records = await base('Clients')
			.select({
				filterByFormula: `FIND("${formattedPhoneNumber}", SUBSTITUTE(Phone, "-", "")) > 0`,
			})
			.all();

		// If no client found with that phone number
		if (records.length === 0) {
			return NextResponse.json(
				{
					success: false,
					error: 'No client found with that phone number',
				},
				{
					status: 404,
					headers: {
						'Cache-Control': 'no-store, max-age=0, must-revalidate',
					},
				},
			);
		}

		// Transform the records to a more friendly format
		const data = records.map(record => ({
			id: record.id,
			...record.fields,
		}));

		// Return the client data
		return NextResponse.json(
			{
				success: true,
				data: data,
			},
			{
				headers: {
					'Cache-Control': 'no-store, max-age=0, must-revalidate',
				},
			},
		);
	} catch (error) {
		console.error(`Error fetching client data by phone number:`, error);
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch client data',
			},
			{
				status: 500,
				headers: {
					'Cache-Control': 'no-store, max-age=0, must-revalidate',
				},
			},
		);
	}
}
