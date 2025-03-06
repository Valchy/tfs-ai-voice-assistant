import { getBaseUrl } from './lib/utils';

// Define the caller history type based on what we expect from Airtable
type CallerHistoryItem = {
	id: string;
	Phone: string;
	Name: string;
	Date: string;
	'Call Type': string;
	Summary?: string;
};

// Define the client item type based on what we expect from Airtable
type ClientItem = {
	id: string;
	Name: string;
	Email: string;
	Phone: string;
	Passport: string;
	Birthday: string;
	'Card Number': string;
	Address: string;
	'Card Status': string[];
};

// Define the card item type based on what we expect from Airtable
export type CardItem = {
	id: string;
	'Card Number': string;
	Phone: string;
	Status: 'Active' | 'Blocked' | 'Frozen';
	Type: 'Debit' | 'Credit';
};

// Function to safely encode to base64 (works in both browser and Node.js)
function base64Encode(str: string): string {
	if (typeof window !== 'undefined') {
		// Browser environment
		return btoa(str);
	} else {
		// Node.js environment
		return Buffer.from(str).toString('base64');
	}
}

// Generic function to fetch data from Airtable endpoints
async function fetchAirtableData<T>(endpoint: string): Promise<T[]> {
	try {
		console.log(`Fetching data from API endpoint ${endpoint}:`, new Date().toISOString());

		// Add a cache-busting parameter to ensure we always get fresh data
		const cacheBuster = `cacheBust=${Date.now()}`;
		const url = `${getBaseUrl()}/api/airtable/get/${endpoint}?${cacheBuster}`;

		console.log('Fetching from URL:', url);

		// Get the auth credentials from environment variables
		const username = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME;
		const password = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD;

		// Create headers object with content type
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};

		// Add Basic Auth header if credentials are available
		if (username && password) {
			const base64Credentials = base64Encode(`${username}:${password}`);
			headers['Authorization'] = `Basic ${base64Credentials}`;
		}

		const response = await fetch(url, {
			method: 'GET',
			headers,
			// Force Next.js to refetch every time
			cache: 'no-store',
			// Also disable caching
			// next: { revalidate: 0 },
		});

		console.log('API response status:', response.status);

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			console.error('API error details:', errorData);
			throw new Error(`Failed to fetch data from ${endpoint}: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		console.log(`Received data from ${endpoint}:`, { success: data.success, count: data.data?.length || 0 });
		return data.success ? data.data : [];
	} catch (error) {
		console.error(`Error fetching data from ${endpoint}:`, error);
		return [];
	}
}

// Function to initiate a call via the Voiceflow API
export async function initiateVoiceflowCall(phoneNumber: string): Promise<boolean> {
	try {
		console.log(`Initiating call to phone number: ${phoneNumber}`);

		// Build the base URL for the call endpoint
		const url = `${getBaseUrl()}/api/voiceflow/call?phone=${encodeURIComponent(phoneNumber)}`;

		// Get the auth credentials from environment variables
		const username = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME;
		const password = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD;

		// Create headers object with content type
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};

		// Add Basic Auth header if credentials are available
		if (username && password) {
			const base64Credentials = base64Encode(`${username}:${password}`);
			headers['Authorization'] = `Basic ${base64Credentials}`;
		}

		const response = await fetch(url, {
			method: 'GET',
			headers,
			cache: 'no-store',
		});

		console.log('Call API response status:', response.status);

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			console.error('Call API error details:', errorData);
			throw new Error(`Failed to initiate call: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		console.log('Call API response:', data);
		return data.success || false;
	} catch (error) {
		console.error('Error initiating call:', error);
		return false;
	}
}

// Function to send an SMS message
export async function sendSmsMessage(phoneNumber: string, message: string): Promise<boolean> {
	try {
		console.log(`Sending SMS to phone number: ${phoneNumber} with message: ${message}`);

		// Build the base URL for the Twilio SMS endpoint
		const url = `${getBaseUrl()}/api/twilio/sms/send`;

		// Get the auth credentials from environment variables
		const username = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME;
		const password = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD;

		// Create headers object with content type
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};

		// Add Basic Auth header if credentials are available
		if (username && password) {
			const base64Credentials = base64Encode(`${username}:${password}`);
			headers['Authorization'] = `Basic ${base64Credentials}`;
		}

		const response = await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify({
				to: phoneNumber, // Twilio endpoint expects 'to' instead of 'phone'
				message: message,
			}),
			cache: 'no-store',
		});

		console.log('SMS API response status:', response.status);

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			console.error('SMS API error details:', errorData);
			throw new Error(`Failed to send SMS: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		console.log('SMS API response:', data);
		return data.success || false;
	} catch (error) {
		console.error('Error sending SMS:', error);
		return false;
	}
}

export async function getCallerHistory(): Promise<CallerHistoryItem[]> {
	return fetchAirtableData<CallerHistoryItem>('caller-history');
}

export async function getClients(): Promise<ClientItem[]> {
	return fetchAirtableData<ClientItem>('clients');
}

export async function getCards(): Promise<CardItem[]> {
	return fetchAirtableData<CardItem>('cards');
}
