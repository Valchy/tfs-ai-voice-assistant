// Define the caller history type based on what we expect from Airtable
type CallerHistoryItem = {
	id: string;
	Name: string;
	Phone: string;
	Date: string;
	Notes?: string;
};

// Define the client item type based on what we expect from Airtable
type ClientItem = {
	id: string;
	Name: string;
	Phone: string;
	PassportNumber: string;
	Birthday: string;
	CardNumber: string;
	Address: string;
	CardStatus: string[];
	Notes?: string;
};

// Generic function to fetch data from Airtable endpoints
async function fetchAirtableData<T>(endpoint: string): Promise<T[]> {
	try {
		console.log(`Fetching data from API endpoint ${endpoint}:`, new Date().toISOString());

		// Add a cache-busting parameter to ensure we always get fresh data
		const cacheBuster = `cacheBust=${Date.now()}`;
		const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://app.valchy.ai';
		const url = `${baseUrl}/api/airtable/${endpoint}?${cacheBuster}`;

		console.log('Fetching from URL:', url);

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
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

export async function getCallerHistory(): Promise<CallerHistoryItem[]> {
	return fetchAirtableData<CallerHistoryItem>('get-caller-history');
}

export async function getClients(): Promise<ClientItem[]> {
	return fetchAirtableData<ClientItem>('get-clients');
}
