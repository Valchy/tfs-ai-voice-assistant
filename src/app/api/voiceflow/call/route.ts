import { createApiHandler, createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/api-utils';
import { NextRequest } from 'next/server';

// Get Voiceflow credentials from environment variables
const VOICEFLOW_DM_API_KEY = process.env.VOICEFLOW_DM_API_KEY;

// Handler function for the GET request
async function callHandler(request: NextRequest) {
	try {
		// Ensure Voiceflow credentials are available
		if (!VOICEFLOW_DM_API_KEY) {
			return createErrorResponse('Voiceflow credentials are not configured properly', 500);
		}

		// Get phone number from URL parameter
		const url = new URL(request.url);
		const phoneNumber = url.searchParams.get('phone');

		// Validate phone number parameter
		if (!phoneNumber) {
			return createErrorResponse('Missing required parameter: "phone" is required', 400);
		}

		// Start a new Voiceflow conversation for this phone number
		const startResponse = await fetch('https://general-runtime.voiceflow.com/state/user/start', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: VOICEFLOW_DM_API_KEY,
			},
			body: JSON.stringify({
				userID: phoneNumber,
				includeTrace: false, // We don't need trace data for this integration
			}),
		});

		if (!startResponse.ok) {
			const errorData = await startResponse.json().catch(() => ({}));
			throw new Error(`Failed to start Voiceflow conversation: ${startResponse.statusText}`);
		}

		// Get the response data
		const startData = await startResponse.json();

		// Send a simple initial interaction to get the conversation started
		const interactResponse = await fetch('https://general-runtime.voiceflow.com/state/user/interact', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: VOICEFLOW_DM_API_KEY,
			},
			body: JSON.stringify({
				userID: phoneNumber,
				action: {
					type: 'start',
				},
			}),
		});

		if (!interactResponse.ok) {
			throw new Error(`Failed to interact with Voiceflow: ${interactResponse.statusText}`);
		}

		// Return success response with conversation data
		return createSuccessResponse({
			message: 'Voiceflow conversation started successfully',
			phoneNumber,
			conversationId: startData.userID,
		});
	} catch (error: any) {
		console.error('Error starting Voiceflow conversation:', error);
		return handleApiError(error);
	}
}

// Apply rate limiting to the GET handler
// Using 'medium' tier for this endpoint
export const GET = createApiHandler(callHandler, {
	rateLimitTier: 'medium',
});
