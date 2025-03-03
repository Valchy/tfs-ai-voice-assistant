// Define the caller history type based on what we expect from Airtable
type CallerHistoryItem = {
	id: string;
	Name: string;
	Phone: string;
	Date: string;
	Notes?: string;
};

export async function getCallerHistory(): Promise<CallerHistoryItem[]> {
	try {
		console.log('Fetching caller history from API endpoint:', new Date().toISOString());

		// Dynamically determine the base URL based on environment
		// In Vercel, we should use the deployment URL or default to relative path
		let baseUrl = '';

		// For Vercel deployments
		if (process.env.VERCEL_URL) {
			baseUrl = `https://${process.env.VERCEL_URL}`;
		}
		// For preview deployments that set NEXT_PUBLIC_VERCEL_URL
		else if (process.env.NEXT_PUBLIC_VERCEL_URL) {
			baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
		}
		// For localhost development
		else if (process.env.NODE_ENV === 'development') {
			baseUrl = 'http://localhost:3000';
		}
		// Default to relative path which should work in most cases
		// An empty baseUrl means we'll use a relative URL, which works in most deployments

		// Add a cache-busting parameter to ensure we always get fresh data
		const cacheBuster = `cacheBust=${Date.now()}`;
		// Use relative URL if baseUrl is empty (better compatibility)
		const url = `${baseUrl || ''}/api/airtable/get-caller-history?${cacheBuster}`;

		console.log('Fetching from URL:', url);

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			// Force Next.js to refetch every time
			cache: 'no-store',
			// Also disable caching
			next: { revalidate: 0 },
		});

		console.log('API response status:', response.status);

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			console.error('API error details:', errorData);
			throw new Error(`Failed to fetch caller history: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		console.log('Received caller history data:', { success: data.success, count: data.data?.length || 0 });
		return data.success ? data.data : [];
	} catch (error) {
		console.error('Error fetching caller history:', error);
		return [];
	}
}

// Define the caller history type based on what we expect from Airtable
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

export async function getClients(): Promise<ClientItem[]> {
	try {
		console.log('Fetching caller history from API endpoint:', new Date().toISOString());

		// Dynamically determine the base URL based on environment
		// In Vercel, we should use the deployment URL or default to relative path
		let baseUrl = '';

		// For Vercel deployments
		if (process.env.VERCEL_URL) {
			baseUrl = `https://${process.env.VERCEL_URL}`;
		}
		// For preview deployments that set NEXT_PUBLIC_VERCEL_URL
		else if (process.env.NEXT_PUBLIC_VERCEL_URL) {
			baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
		}
		// For localhost development
		else if (process.env.NODE_ENV === 'development') {
			baseUrl = 'http://localhost:3000';
		}
		// Default to relative path which should work in most cases
		// An empty baseUrl means we'll use a relative URL, which works in most deployments

		// Add a cache-busting parameter to ensure we always get fresh data
		const cacheBuster = `cacheBust=${Date.now()}`;
		// Use relative URL if baseUrl is empty (better compatibility)
		const url = `${baseUrl || ''}/api/airtable/get-clients?${cacheBuster}`;

		console.log('Fetching from URL:', url);

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			// Force Next.js to refetch every time
			cache: 'no-store',
			// Also disable caching
			next: { revalidate: 0 },
		});

		console.log('API response status:', response.status);

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			console.error('API error details:', errorData);
			throw new Error(`Failed to fetch caller history: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		console.log('Received caller history data:', { success: data.success, count: data.data?.length || 0 });
		return data.success ? data.data : [];
	} catch (error) {
		console.error('Error fetching caller history:', error);
		return [];
	}
}

export async function getEvent(id: string) {
	return (await getEvents()).find(event => event.id.toString() === id)!;
}

export async function getEvents() {
	return [
		{
			id: 1000,
			name: 'Bear Hug: Live in Concert',
			url: '/events/1000',
			date: 'May 20, 2024',
			time: '10 PM',
			location: 'Harmony Theater, Winnipeg, MB',
			totalRevenue: '$102,552',
			totalRevenueChange: '+3.2%',
			ticketsAvailable: 500,
			ticketsSold: 350,
			ticketsSoldChange: '+8.1%',
			pageViews: '24,300',
			pageViewsChange: '-0.75%',
			status: 'On Sale',
			imgUrl: '/events/bear-hug.jpg',
			thumbUrl: '/events/bear-hug-thumb.jpg',
		},
		{
			id: 1001,
			name: 'Six Fingers — DJ Set',
			url: '/events/1001',
			date: 'Jun 2, 2024',
			time: '8 PM',
			location: 'Moonbeam Arena, Uxbridge, ON',
			totalRevenue: '$24,115',
			totalRevenueChange: '+3.2%',
			ticketsAvailable: 150,
			ticketsSold: 72,
			ticketsSoldChange: '+8.1%',
			pageViews: '57,544',
			pageViewsChange: '-2.5%',
			status: 'On Sale',
			imgUrl: '/events/six-fingers.jpg',
			thumbUrl: '/events/six-fingers-thumb.jpg',
		},
		{
			id: 1002,
			name: 'We All Look The Same',
			url: '/events/1002',
			date: 'Aug 5, 2024',
			time: '4 PM',
			location: 'Electric Coliseum, New York, NY',
			totalRevenue: '$40,598',
			totalRevenueChange: '+3.2%',
			ticketsAvailable: 275,
			ticketsSold: 275,
			ticketsSoldChange: '+8.1%',
			pageViews: '122,122',
			pageViewsChange: '-8.0%',
			status: 'Closed',
			imgUrl: '/events/we-all-look-the-same.jpg',
			thumbUrl: '/events/we-all-look-the-same-thumb.jpg',
		},
		{
			id: 1003,
			name: 'Viking People',
			url: '/events/1003',
			date: 'Dec 31, 2024',
			time: '8 PM',
			location: 'Tapestry Hall, Cambridge, ON',
			totalRevenue: '$3,552',
			totalRevenueChange: '+3.2%',
			ticketsAvailable: 40,
			ticketsSold: 6,
			ticketsSoldChange: '+8.1%',
			pageViews: '9,000',
			pageViewsChange: '-0.15%',
			status: 'On Sale',
			imgUrl: '/events/viking-people.jpg',
			thumbUrl: '/events/viking-people-thumb.jpg',
		},
	];
}

export function getCountries() {
	return [
		{
			name: 'Canada',
			code: 'CA',
			flagUrl: '/flags/ca.svg',
			regions: [
				'Alberta',
				'British Columbia',
				'Manitoba',
				'New Brunswick',
				'Newfoundland and Labrador',
				'Northwest Territories',
				'Nova Scotia',
				'Nunavut',
				'Ontario',
				'Prince Edward Island',
				'Quebec',
				'Saskatchewan',
				'Yukon',
			],
		},
		{
			name: 'Mexico',
			code: 'MX',
			flagUrl: '/flags/mx.svg',
			regions: [
				'Aguascalientes',
				'Baja California',
				'Baja California Sur',
				'Campeche',
				'Chiapas',
				'Chihuahua',
				'Ciudad de Mexico',
				'Coahuila',
				'Colima',
				'Durango',
				'Guanajuato',
				'Guerrero',
				'Hidalgo',
				'Jalisco',
				'Mexico State',
				'Michoacán',
				'Morelos',
				'Nayarit',
				'Nuevo León',
				'Oaxaca',
				'Puebla',
				'Querétaro',
				'Quintana Roo',
				'San Luis Potosí',
				'Sinaloa',
				'Sonora',
				'Tabasco',
				'Tamaulipas',
				'Tlaxcala',
				'Veracruz',
				'Yucatán',
				'Zacatecas',
			],
		},
		{
			name: 'United States',
			code: 'US',
			flagUrl: '/flags/us.svg',
			regions: [
				'Alabama',
				'Alaska',
				'American Samoa',
				'Arizona',
				'Arkansas',
				'California',
				'Colorado',
				'Connecticut',
				'Delaware',
				'Washington DC',
				'Micronesia',
				'Florida',
				'Georgia',
				'Guam',
				'Hawaii',
				'Idaho',
				'Illinois',
				'Indiana',
				'Iowa',
				'Kansas',
				'Kentucky',
				'Louisiana',
				'Maine',
				'Marshall Islands',
				'Maryland',
				'Massachusetts',
				'Michigan',
				'Minnesota',
				'Mississippi',
				'Missouri',
				'Montana',
				'Nebraska',
				'Nevada',
				'New Hampshire',
				'New Jersey',
				'New Mexico',
				'New York',
				'North Carolina',
				'North Dakota',
				'Northern Mariana Islands',
				'Ohio',
				'Oklahoma',
				'Oregon',
				'Palau',
				'Pennsylvania',
				'Puerto Rico',
				'Rhode Island',
				'South Carolina',
				'South Dakota',
				'Tennessee',
				'Texas',
				'Utah',
				'Vermont',
				'U.S. Virgin Islands',
				'Virginia',
				'Washington',
				'West Virginia',
				'Wisconsin',
				'Wyoming',
				'Armed Forces Americas',
				'Armed Forces Europe',
				'Armed Forces Pacific',
			],
		},
	];
}

// Define the RecentOrder type
type RecentOrder = {
	id: string;
	date: string;
	url: string;
	customer: {
		name: string;
	};
	event: {
		name: string;
		thumbUrl: string;
	};
	amount: {
		usd: string;
	};
};

export async function getRecentOrders(): Promise<RecentOrder[]> {
	// Mock data for recent orders
	return [
		{
			id: 'ORD-1234',
			date: 'May 15, 2024',
			url: '/orders/1234',
			customer: {
				name: 'Jane Smith',
			},
			event: {
				name: 'Bear Hug: Live in Concert',
				thumbUrl: '/events/bear-hug-thumb.jpg',
			},
			amount: {
				usd: '$250.00',
			},
		},
		{
			id: 'ORD-1235',
			date: 'May 14, 2024',
			url: '/orders/1235',
			customer: {
				name: 'John Davis',
			},
			event: {
				name: 'Six Fingers — DJ Set',
				thumbUrl: '/events/six-fingers-thumb.jpg',
			},
			amount: {
				usd: '$125.00',
			},
		},
		{
			id: 'ORD-1236',
			date: 'May 13, 2024',
			url: '/orders/1236',
			customer: {
				name: 'Michael Johnson',
			},
			event: {
				name: 'We All Look The Same',
				thumbUrl: '/events/we-all-look-the-same-thumb.jpg',
			},
			amount: {
				usd: '$180.00',
			},
		},
	];
}
