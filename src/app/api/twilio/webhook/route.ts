import { createApiHandler, createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/api-utils';
import { getBaseUrl } from '@/lib/utils';
import { NextRequest } from 'next/server';

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

// Handler function for Twilio webhook POST requests
async function webhookHandler(request: NextRequest) {
	try {
		// Extract query parameters for authentication
		const url = new URL(request.url);
		const username = url.searchParams.get('username');
		const password = url.searchParams.get('password');

		// Parse form data from the request body (Twilio sends form-encoded data)
		const formData = await request.formData();

		// Convert FormData to a regular object for easier access and logging
		const bodyData: Record<string, any> = {};
		formData.forEach((value, key) => {
			bodyData[key] = value;
		});

		// Validate authentication
		if (!validateCredentials(username, password)) {
			return createErrorResponse('Unauthorized: Invalid credentials', 401);
		}

		// Extract required fields from the body
		const from = bodyData['From'];
		const messageBody = bodyData['Body'];

		// Validate required parameters
		if (!messageBody) {
			return createErrorResponse('Missing required parameter: Body', 400);
		}

		if (!from) {
			return createErrorResponse('Missing required parameter: From', 400);
		}

		// 1. Get the NEXT_FIELD_UPDATE value from Airtable using the From number
		const airtableGetResponse = await fetch(`${getBaseUrl()}/api/airtable/get/NEXT_FIELD_UPDATE?phone=${encodeURIComponent(from)}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
			},
		});

		if (!airtableGetResponse.ok) {
			throw new Error(`Failed to get Airtable data: ${airtableGetResponse.statusText}`);
		}

		const airtableGetData = await airtableGetResponse.json();
		const fieldToUpdate = airtableGetData.data;

		if (!fieldToUpdate) {
			return createErrorResponse('No NEXT_FIELD_UPDATE value found for client', 404);
		}

		// 2. Update the specified field with the SMS text (Body)
		console.log(from, messageBody);
		const updateResponse = await fetch(`${getBaseUrl()}/api/airtable/update/${fieldToUpdate}?phone=${encodeURIComponent(from)}&value=${encodeURIComponent(messageBody)}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
			},
		});

		if (!updateResponse.ok) {
			throw new Error(`Failed to update Airtable: ${updateResponse.statusText}`);
		}

		const updateData = await updateResponse.json();

		// 3. Return success response with updated data
		return createSuccessResponse({
			message: `Successfully processed SMS and updated ${fieldToUpdate} field`,
			smsText: messageBody,
			updatedData: updateData.data,
			body: bodyData,
		});
	} catch (error: any) {
		console.error('Error processing webhook:', error);
		return handleApiError(error);
	}
}

// Apply rate limiting to the webhook handler
// Using 'low' tier for the webhook since it could receive more frequent calls
export const POST = createApiHandler(webhookHandler, {
	rateLimitTier: 'low',
});
