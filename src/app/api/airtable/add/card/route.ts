import Airtable from 'airtable';
import { NextRequest, NextResponse } from 'next/server';

// Get Airtable credentials from environment variables
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

// Allowed status values for the cards
const ALLOWED_STATUSES = ['Active', 'Blocked', 'Frozen'];

// Allowed type values for the cards
const ALLOWED_TYPES = ['Debit', 'Credit', 'Business'];

/**
 * Generates a random 16-digit card number
 * @returns A string containing a random 16-digit number
 */
function generateCardNumber(): string {
	// Generate 16 random digits
	let cardNumber = '';
	for (let i = 0; i < 16; i++) {
		cardNumber += Math.floor(Math.random() * 10).toString();
	}
	return cardNumber;
}

/**
 * POST /api/airtable/add/card
 *
 * Adds a new card to the 'Cards' table in Airtable
 * Required fields: phone, status, type
 * Card number is automatically generated
 */
export async function POST(request: NextRequest) {
	try {
		// Validate Airtable environment variables
		if (!apiKey || !baseId) {
			throw new Error('Airtable environment variables are not properly configured');
		}

		// Initialize Airtable
		const base = new Airtable({ apiKey }).base(baseId);

		// Parse form data or JSON body
		let phone: string, status: string, type: string;

		const contentType = request.headers.get('content-type') || '';

		if (contentType.includes('application/json')) {
			// Parse JSON body
			const body = await request.json();
			phone = body.phone;
			type = body.type;
			status = body?.status || 'Active';
		} else {
			// Parse form data
			const formData = await request.formData();
			phone = formData.get('phone')?.toString() || '';
			type = formData.get('type')?.toString() || '';
			status = formData.get('status')?.toString() || 'Active';
		}

		// Validate required fields
		if (!phone || !status || !type) {
			return NextResponse.json(
				{
					success: false,
					error: 'All fields (phone, status, type) are required',
				},
				{
					status: 400,
					headers: {
						'Cache-Control': 'no-store, max-age=0, must-revalidate',
					},
				},
			);
		}

		// Validate status
		if (!ALLOWED_STATUSES.includes(status)) {
			return NextResponse.json(
				{
					success: false,
					error: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`,
				},
				{
					status: 400,
					headers: {
						'Cache-Control': 'no-store, max-age=0, must-revalidate',
					},
				},
			);
		}

		// Validate type
		if (!ALLOWED_TYPES.includes(type)) {
			return NextResponse.json(
				{
					success: false,
					error: `Invalid type. Allowed values: ${ALLOWED_TYPES.join(', ')}`,
				},
				{
					status: 400,
					headers: {
						'Cache-Control': 'no-store, max-age=0, must-revalidate',
					},
				},
			);
		}

		// Format the phone
		const formattedPhone = phone.trim();

		// Generate a unique card number
		let formattedCardNumber = '';
		let isUnique = false;
		let maxAttempts = 10; // Prevent infinite loops

		while (!isUnique && maxAttempts > 0) {
			formattedCardNumber = generateCardNumber();

			// Check if card already exists
			const existingCards = await base('Cards')
				.select({
					filterByFormula: `{Card Number} = "${formattedCardNumber}"`,
				})
				.all();

			if (existingCards.length === 0) {
				isUnique = true;
			} else {
				maxAttempts--;
			}
		}

		if (!isUnique) {
			throw new Error('Failed to generate a unique card number after multiple attempts');
		}

		console.log('Adding new card:', {
			'Card Number': formattedCardNumber,
			Phone: formattedPhone,
			Status: status,
			Type: type,
		});

		// Create new card record
		const createdRecord = await base('Cards').create({
			'Card Number': formattedCardNumber,
			Phone: formattedPhone,
			Status: status,
			Type: type,
		});

		// Return the newly created card data
		return NextResponse.json(
			{
				success: true,
				data: {
					id: createdRecord.id,
					...createdRecord.fields,
				},
			},
			{
				status: 201, // Created
				headers: {
					'Cache-Control': 'no-store, max-age=0, must-revalidate',
				},
			},
		);
	} catch (error) {
		console.error('Error adding card:', error);
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to add card',
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
