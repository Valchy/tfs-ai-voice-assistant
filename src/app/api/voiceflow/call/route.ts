import { NextRequest, NextResponse } from 'next/server';

// Get Voiceflow credentials from environment variables
const VOICEFLOW_DM_API_KEY = process.env.VOICEFLOW_DM_API_KEY;
const VOICEFLOW_PHONE_NUMBER = process.env.VOICEFLOW_PHONE_NUMBER;

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
		const card = url.searchParams.get('card') || '';
		const fraudAlert = url.searchParams.get('fraudAlert') || 'no';

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
		const response = await fetch(`https://runtime-api.voiceflow.com/v1alpha1/phone-number/${VOICEFLOW_PHONE_NUMBER}/outbound`, {
			method: 'POST',
			headers: {
				'Authorization': VOICEFLOW_DM_API_KEY,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				to: phoneNumber,
				variables: { fraud_alert: fraudAlert, user_card_number: card },
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
