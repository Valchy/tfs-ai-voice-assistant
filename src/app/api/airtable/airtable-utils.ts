import { handleApiError } from '@/lib/api-utils';
import Airtable from 'airtable';
import { NextResponse } from 'next/server';

// Cache for in-progress requests to deduplicate concurrent API calls
const pendingRequests = new Map<string, Promise<NextResponse>>();

// TTL for cache entries in milliseconds (30 seconds)
const CACHE_TTL = 30000;

// Cache for completed requests
const responseCache = new Map<string, { response: NextResponse; timestamp: number }>();

/**
 * Fetches records from an Airtable table with request deduplication
 * @param tableName The name of the table to fetch data from
 * @param errorMessage The error message to return if the fetch fails
 * @returns NextResponse with the fetched data
 */
export async function fetchAirtableRecords(tableName: string, errorMessage: string = 'Failed to fetch data') {
	try {
		// Create a cache key
		const cacheKey = `table:${tableName}`;

		// Check if this request is already cached
		const now = Date.now();
		const cachedResponse = responseCache.get(cacheKey);

		if (cachedResponse && now - cachedResponse.timestamp < CACHE_TTL) {
			console.log(`Using cached response for ${tableName}, age: ${now - cachedResponse.timestamp}ms`);
			return cachedResponse.response;
		}

		// Check if there's a pending request for this table
		if (pendingRequests.has(cacheKey)) {
			console.log(`Reusing pending request for ${tableName}`);
			return pendingRequests.get(cacheKey)!;
		}

		// Create a new request
		console.log(`Making fresh request to Airtable for ${tableName}`);

		// Define the actual fetching function
		const fetchPromise = (async () => {
			try {
				// Get Airtable credentials from environment variables
				const apiKey = process.env.AIRTABLE_API_KEY;
				const baseId = process.env.AIRTABLE_BASE_ID;

				// Validate Airtable environment variables
				if (!apiKey || !baseId || !tableName) {
					throw new Error('Airtable environment variables are not properly configured');
				}

				// Initialize Airtable
				const base = new Airtable({ apiKey }).base(baseId);

				// Fetch all records from the table
				const records = await base(tableName)
					.select({
						// You can add view, filterByFormula, etc. here if needed
						// view: 'Grid view',
					})
					.all();

				// Transform the records to a more friendly format
				const data = records.map(record => {
					return {
						id: record.id,
						...record.fields,
					};
				});

				// Create response with cache control headers
				const response = NextResponse.json(
					{
						success: true,
						data: data,
					},
					{
						headers: {
							'Cache-Control': 'private, max-age=30',
							'Expires': new Date(now + CACHE_TTL).toUTCString(),
						},
					},
				);

				// Cache the response
				responseCache.set(cacheKey, {
					response,
					timestamp: now,
				});

				return response;
			} catch (error) {
				console.error(`Error fetching data from Airtable table ${tableName}:`, error);
				return NextResponse.json(
					{
						success: false,
						error: errorMessage,
					},
					{
						status: 500,
						headers: {
							'Cache-Control': 'no-store, max-age=0',
						},
					},
				);
			} finally {
				// Remove from pending requests
				pendingRequests.delete(cacheKey);
			}
		})();

		// Store the promise in the pending requests
		pendingRequests.set(cacheKey, fetchPromise);

		return fetchPromise;
	} catch (error) {
		console.error(`Unexpected error in fetchAirtableRecords for ${tableName}:`, error);
		return handleApiError(error);
	}
}

// Periodic cleanup of old cache entries
setInterval(() => {
	const now = Date.now();
	Array.from(responseCache.entries()).forEach(([key, entry]) => {
		if (now - entry.timestamp > CACHE_TTL) {
			responseCache.delete(key);
		}
	});
}, CACHE_TTL); // Run cleanup every 30 seconds
