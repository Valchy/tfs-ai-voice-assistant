import { NextRequest, NextResponse } from 'next/server';

// Get Voiceflow credentials from environment variables
const VOICEFLOW_DM_API_KEY = process.env.VOICEFLOW_DM_API_KEY;

export async function GET(request: NextRequest) {
	try {
		// Ensure Voiceflow credentials are available
		if (!VOICEFLOW_DM_API_KEY) {
			return NextResponse.json(
				{
					success: false,
					error: 'Voiceflow credentials are not configured properly',
				},
				{ status: 500 },
			);
		}

		// Get phone number from URL parameter
		const url = new URL(request.url);
		const phoneNumber = url.searchParams.get('phone');
		const name = url.searchParams.get('name');

		// Validate phone number parameter
		if (!phoneNumber) {
			return NextResponse.json(
				{
					success: false,
					error: 'Missing required parameter: "phone" is required',
				},
				{ status: 400 },
			);
		}

		// Call the Voiceflow API
		const response = await fetch('https://runtime-api.voiceflow.com/v1alpha1/phone-number/6762928d7edb2c774af35435/outbound', {
			method: 'POST',
			headers: {
				'Authorization': VOICEFLOW_DM_API_KEY,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				to: phoneNumber,
				variables: { fraud_alert: 'yes', name: name || '' },
			}),
		});

		if (!response.ok) {
			// Parse and return the response
			const data = await response.json();

			return NextResponse.json(
				{
					success: false,
					error: data.message || 'Failed to initiate Voiceflow call',
					details: data,
				},
				{ status: response.status },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error('Error initiating Voiceflow call:', error);

		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to initiate Voiceflow call',
			},
			{ status: 500 },
		);
	}
}
