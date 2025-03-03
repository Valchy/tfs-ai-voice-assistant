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

		// Additional parameters from the URL if needed
		const fraudAlert = url.searchParams.get('fraud_alert') === 'true';

		// Call the Voiceflow API
		const response = await fetch('https://runtime-api.voiceflow.com/v1alpha1/phone-number/67c3838f5f78c85c1ac6646b/outbound', {
			method: 'POST',
			headers: {
				'Authorization': VOICEFLOW_DM_API_KEY,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				to: phoneNumber,
				variables: {
					fraud_alert: fraudAlert,
				},
			}),
		});

		// Parse and return the response
		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{
					success: false,
					error: data.message || 'Failed to initiate Voiceflow call',
					details: data,
				},
				{ status: response.status },
			);
		}

		return NextResponse.json({
			success: true,
			data,
		});
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
