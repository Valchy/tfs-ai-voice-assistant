import { getBaseUrl } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

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
			return NextResponse.json(
				{
					success: false,
					error: 'Unauthorized: Invalid credentials',
				},
				{ status: 401 },
			);
		}

		// Extract required fields from the body
		const from = bodyData['From'];
		const messageBody = bodyData['Body'];

		// Validate required parameters
		if (!messageBody) {
			return NextResponse.json(
				{
					success: false,
					error: 'Missing required parameter: Body',
				},
				{ status: 400 },
			);
		}

		if (!from) {
			return NextResponse.json(
				{
					success: false,
					error: 'Missing required parameter: From',
				},
				{ status: 400 },
			);
		}

		// 1. Get the NEXT_FIELD_UPDATE value from Airtable using the From number
		const airtableGetResponse = await fetch(`${getBaseUrl()}/api/airtable/get/NEXT_FIELD_UPDATE?phone=${encodeURIComponent(from)}&username=${username}&password=${password}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!airtableGetResponse.ok) {
			throw new Error(`Failed to get Airtable data: ${airtableGetResponse.statusText}`);
		}

		const airtableGetData = await airtableGetResponse.json();
		const fieldToUpdate = airtableGetData.data;

		if (!fieldToUpdate) {
			return NextResponse.json(
				{
					success: false,
					error: 'No NEXT_FIELD_UPDATE value found for client',
				},
				{ status: 404 },
			);
		}

		// 2. Update the specified field with the SMS text (Body)
		console.log(from, messageBody);
		const updateResponse = await fetch(
			`${getBaseUrl()}/api/airtable/update/client/${fieldToUpdate}?phone=${encodeURIComponent(from)}&value=${encodeURIComponent(messageBody)}&username=${username}&password=${password}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			},
		);

		if (!updateResponse.ok) {
			throw new Error(`Failed to update Airtable: ${updateResponse.statusText}`);
		}

		const updateData = await updateResponse.json();

		// 3. Return success response with updated data
		return NextResponse.json(
			{
				success: true,
				message: `Successfully processed SMS and updated ${fieldToUpdate} field`,
				smsText: messageBody,
				updatedData: updateData.data,
				body: bodyData,
			},
			{ status: 200 },
		);
	} catch (error: any) {
		console.error('Error processing webhook:', error);

		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to process webhook',
			},
			{ status: 500 },
		);
	}
}
