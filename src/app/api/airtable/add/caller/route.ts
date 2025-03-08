import Airtable from 'airtable';
import { NextRequest, NextResponse } from 'next/server';

// Get Airtable credentials from environment variables
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

// Basic auth credentials from environment variables
const AUTH_USERNAME = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME;
const AUTH_PASSWORD = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD;

// Function to validate basic auth credentials
function validateCredentials(username: string | null, password: string | null): boolean {
	if (!AUTH_USERNAME || !AUTH_PASSWORD) {
		console.error('Auth credentials not configured in environment variables');
		return false;
	}

	return username === AUTH_USERNAME && password === AUTH_PASSWORD;
}

export async function POST(request: NextRequest) {
	try {
		// Extract query parameters for authentication and data
		const url = new URL(request.url);
		const username = url.searchParams.get('username');
		const password = url.searchParams.get('password');
		const phone = url.searchParams.get('phone');
		const name = url.searchParams.get('name'); // Optional

		// Validate authentication
		if (!validateCredentials(username, password)) {
			return NextResponse.json(
				{
					success: false,
					error: 'Unauthorized: Invalid credentials',
				},
				{ status: 401 },
			);
		}

		// Validate required parameters
		if (!phone) {
			return NextResponse.json(
				{
					success: false,
					error: 'Missing required parameter: "phone" is required',
				},
				{ status: 400 },
			);
		}

		// Validate Airtable environment variables
		if (!apiKey || !baseId) {
			return NextResponse.json(
				{
					success: false,
					error: 'Airtable environment variables are not properly configured',
				},
				{ status: 500 },
			);
		}

		// Initialize Airtable
		const base = new Airtable({ apiKey }).base(baseId);

		// Create fields object with required and optional fields
		const fields: Record<string, any> = {
			Phone: decodeURIComponent(phone),
		};

		// Add name if provided
		if (name) {
			fields.Name = name;
		}

		// Create the record in the Call History table
		const createdRecords = await base('Call History').create([
			{
				fields,
			},
		]);

		// Transform the created record to a more friendly format
		const recordData = {
			id: createdRecords[0].id,
			...createdRecords[0].fields,
		};

		// Return success response with the created record
		return NextResponse.json(
			{
				success: true,
				data: recordData,
			},
			{
				headers: {
					'Cache-Control': 'no-store, max-age=0, must-revalidate',
				},
			},
		);
	} catch (error: any) {
		console.error('Error adding caller to Call History:', error);

		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to add caller to Call History',
			},
			{ status: 500 },
		);
	}
}
