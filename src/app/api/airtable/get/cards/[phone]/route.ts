import Airtable from 'airtable';
import { NextRequest, NextResponse } from 'next/server';

// Get Airtable credentials from environment variables
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

// Basic auth credentials from environment variables
const AUTH_USERNAME = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME;
const AUTH_PASSWORD = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD;

/**
 * GET /api/airtable/get/cards/[phone]
 *
 * Fetches cards associated with a specific phone number from the 'Cards' table in Airtable
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

		console.log('Searching for cards with phone:', decodedPhone, '=>', formattedPhoneNumber);

		// Fetch cards from the Cards table with matching phone number
		const records = await base('Cards')
			.select({
				filterByFormula: `OR(
					FIND("${formattedPhoneNumber}", SUBSTITUTE(Phone, "-", "")) > 0,
					FIND("${formattedPhoneNumber}", SUBSTITUTE(SUBSTITUTE(Phone, "+", ""), "-", "")) > 0
				)`,
			})
			.all();

		if (records.length === 0) {
			return NextResponse.json(
				{
					success: false,
					error: 'No cards found for that phone number',
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

		// Extract card numbers from the records using the correct field name "Card Number"
		const cardNumbers = records
			.map(record => record.fields['Card Number'] || '')
			.filter(Boolean)
			.join(',');

		// Extract just the last 4 digits of each card number
		const cardNumberLastFourDigits = records
			.map(record => {
				const cardNumberField = record.fields['Card Number'];
				// Convert to string and handle undefined/null
				const cardNumberStr = cardNumberField ? String(cardNumberField) : '';
				// Only get the last 4 digits if the card number has at least 4 digits
				return cardNumberStr.length >= 4 ? cardNumberStr.slice(-4) : cardNumberStr;
			})
			.filter(Boolean)
			.join(', ')
			.replace(/,([^,]*)$/, ' and$1');

		// Return the cards data
		return NextResponse.json(
			{
				success: true,
				data: data,
				cardNumbers: cardNumbers, // Full card numbers as comma-separated string
				cardNumberLastFourDigits: cardNumberLastFourDigits, // Last 4 digits as comma-separated string
			},
			{
				headers: {
					'Cache-Control': 'no-store, max-age=0, must-revalidate',
				},
			},
		);
	} catch (error) {
		console.error(`Error fetching cards data by phone number:`, error);
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch cards data',
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
