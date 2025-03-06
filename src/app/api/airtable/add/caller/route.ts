import { createApiHandler, createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/api-utils';
import Airtable from 'airtable';
import { NextRequest } from 'next/server';

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

export const dynamic = 'force-dynamic'; // This prevents Edge and Vercel from caching

// Handler function for POST requests
async function addCallerHandler(request: NextRequest) {
	try {
		// Extract query parameters for authentication and data
		const url = new URL(request.url);
		const username = url.searchParams.get('username');
		const password = url.searchParams.get('password');
		const phone = url.searchParams.get('phone');

		// Validate authentication
		if (!validateCredentials(username, password)) {
			return createErrorResponse('Unauthorized: Invalid credentials', 401);
		}

		// Validate Airtable environment variables
		if (!apiKey || !baseId) {
			return createErrorResponse('Airtable environment variables are not properly configured', 500);
		}

		// Validate phone number parameter
		if (!phone) {
			return createErrorResponse('Missing required parameter: phone', 400);
		}

		// Initialize Airtable
		const base = new Airtable({ apiKey }).base(baseId);

		// Check if client already exists with this phone number
		const existingRecords = await base('Clients')
			.select({
				filterByFormula: `{Phone} = "${phone}"`,
				maxRecords: 1,
			})
			.all();

		// If a client with this phone number already exists, return error or existing client data
		if (existingRecords.length > 0) {
			return createSuccessResponse(
				{
					message: 'Client with this phone number already exists',
					client: {
						id: existingRecords[0].id,
						...existingRecords[0].fields,
					},
				},
				200,
			);
		}

		// Add new client to Airtable
		const createdRecords = await base('Clients').create([
			{
				fields: {
					Phone: phone,
					Status: 'New',
					NEXT_FIELD_UPDATE: 'FirstName', // Set the next field to be updated via SMS
				},
			},
		]);

		// Return success response with created client data
		if (createdRecords && createdRecords.length > 0) {
			return createSuccessResponse(
				{
					message: 'Successfully added new caller',
					client: {
						id: createdRecords[0].id,
						...createdRecords[0].fields,
					},
				},
				201,
			);
		} else {
			throw new Error('Failed to create client record');
		}
	} catch (error: any) {
		console.error('Error adding caller:', error);
		return handleApiError(error);
	}
}

// Handler for POST requests
export const POST = createApiHandler(addCallerHandler);
