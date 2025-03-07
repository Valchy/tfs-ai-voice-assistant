import Airtable from 'airtable';
import { NextRequest, NextResponse } from 'next/server';

// Get Airtable credentials from environment variables
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

// Basic auth credentials from environment variables
const AUTH_USERNAME = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME;
const AUTH_PASSWORD = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD;

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

		// Validate credentials if environment variables are set
		if (AUTH_USERNAME && AUTH_PASSWORD) {
			if (!username || !password || username !== AUTH_USERNAME || password !== AUTH_PASSWORD) {
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

		// Validate Airtable environment variables
		if (!apiKey || !baseId) {
			throw new Error('Airtable environment variables are not properly configured');
		}

		// Initialize Airtable
		const base = new Airtable({ apiKey }).base(baseId);

		// Decode the URL-encoded phone number and then format it
		const decodedPhone = decodeURIComponent(phone);

		// Format the phone number to search - keep only digits
		// (this removes the '+' and any other non-digit characters)
		const formattedPhoneNumber = decodedPhone.replace(/\D/g, '');

		console.log('Searching for phone:', decodedPhone, '=>', formattedPhoneNumber);

		// Fetch records from the Clients table with exact phone number match
		const records = await base('Clients')
			.select({
				filterByFormula: `OR(
					SUBSTITUTE(Phone, "-", "") = "${formattedPhoneNumber}",
					SUBSTITUTE(SUBSTITUTE(Phone, "+", ""), "-", "") = "${formattedPhoneNumber}"
				)`,
			})
			.all();

		// Since phone is a primary key, we expect at most one result
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
