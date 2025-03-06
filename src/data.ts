import { getBaseUrl } from './lib/utils';

// Define the caller history type based on what we expect from Airtable
type CallerHistoryItem = {
	id: string;
	Phone: string;
	Name: string;
	Date: string;
	'Call Type': string;
	Notes?: string;
};

// Define the client item type based on what we expect from Airtable
type ClientItem = {
	id: string;
	Name: string;
	Phone: string;
	'Passport Number': string;
	Birthday: string;
	'Card Number': string;
	Address: string;
	'Card Status': string[];
	Notes?: string;
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

// Cache for API responses with timestamp
interface CacheEntry<T> {
	data: T[];
	timestamp: number;
}

// In-memory cache to prevent redundant API calls
const apiCache = new Map<string, CacheEntry<any>>();

// Cache TTL in milliseconds (30 seconds)
const CACHE_TTL = 30000;

// Track ongoing requests to prevent duplicate calls
const pendingRequests = new Map<string, Promise<any[]>>();

// Generic function to fetch data from Airtable endpoints with caching
async function fetchAirtableData<T>(endpoint: string): Promise<T[]> {
	try {
		// 1. Check if we have a valid cached response
		const cachedEntry = apiCache.get(endpoint);
		const now = Date.now();

		if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
			console.log(`Using cached data for ${endpoint}, age: ${now - cachedEntry.timestamp}ms`);
			return cachedEntry.data;
		}

		// 2. Check if there's already a pending request for this endpoint
		if (pendingRequests.has(endpoint)) {
			console.log(`Reusing pending request for ${endpoint}`);
			return pendingRequests.get(endpoint) as Promise<T[]>;
		}

		// 3. If not cached and no pending request, make a new request
		console.log(`Making fresh request for ${endpoint}`);

		// Create a promise for the request and store it
		const fetchPromise = (async () => {
			try {
				// Build the URL
				const url = `${getBaseUrl()}/api/airtable/get/${endpoint}`;

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

				// Use a consistent caching strategy - only use no-store to prevent caching conflicts
				const response = await fetch(url, {
					method: 'GET',
					headers,
					cache: 'no-store',
				});

				if (!response.ok) {
					throw new Error(`Failed to fetch data from ${endpoint}: ${response.status} ${response.statusText}`);
				}

				const data = await response.json();
				const resultData = data.success ? data.data : [];

				// Store successful result in cache
				apiCache.set(endpoint, { data: resultData, timestamp: now });

				console.log(`Successful data fetch for ${endpoint}, items: ${resultData.length}`);
				return resultData;
			} finally {
				// Remove from pending requests when done (success or error)
				pendingRequests.delete(endpoint);
			}
		})();

		// Store the promise in the pending requests
		pendingRequests.set(endpoint, fetchPromise);

		return fetchPromise;
	} catch (error) {
		console.error(`Error fetching data from ${endpoint}:`, error);
		// Remove from pending requests if there's an error
		pendingRequests.delete(endpoint);
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

// Create singleton instances to store data globally
let callerHistoryCache: CallerHistoryItem[] = [];
let callerHistoryTimestamp = 0;

let clientsCache: ClientItem[] = [];
let clientsTimestamp = 0;

export async function getCallerHistory(): Promise<CallerHistoryItem[]> {
	// Use the global cache if it's still fresh
	const now = Date.now();
	if (callerHistoryCache.length > 0 && now - callerHistoryTimestamp < CACHE_TTL) {
		console.log('Using global callerHistoryCache');
		return callerHistoryCache;
	}

	// Otherwise fetch new data
	const data = await fetchAirtableData<CallerHistoryItem>('caller-history');

	// Update the global cache
	callerHistoryCache = data;
	callerHistoryTimestamp = now;

	return data;
}

export async function getClients(): Promise<ClientItem[]> {
	// Use the global cache if it's still fresh
	const now = Date.now();
	if (clientsCache.length > 0 && now - clientsTimestamp < CACHE_TTL) {
		console.log('Using global clientsCache');
		return clientsCache;
	}

	// Otherwise fetch new data
	const data = await fetchAirtableData<ClientItem>('clients');

	// Update the global cache
	clientsCache = data;
	clientsTimestamp = now;

	return data;
}
