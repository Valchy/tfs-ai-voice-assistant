'use client';

// Disable static generation and ensure this page is dynamically rendered
export const dynamic = 'force-dynamic';

import { Heading } from '@/components/heading';
import { PageWrapper } from '@/components/page-wrapper';
import { DataItem, SearchableTable } from '@/components/searchable-table';
import { TableSkeleton } from '@/components/skeleton';
import { getClients } from '@/data';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PhoneButton } from './phone-button';
import { SmsButton } from './sms-button';

// Client type definition
export type Client = DataItem & {
	Name?: string;
	Phone?: string;
	PassportNumber?: string;
	CardStatus?: string[];
	Notes?: string;
};

// Memoized client table component to prevent unnecessary re-renders
const ClientsTable = ({ clients }: { clients: Client[] }) => {
	console.log(`Rendering ClientsTable with ${clients.length} clients`);

	// Define columns for the table - memoize this if it causes performance issues
	const columns = [
		{ key: 'Name', header: 'Name' },
		{ key: 'Phone', header: 'Phone Number' },
		{ key: 'Email', header: 'Email' },
		{ key: 'Birthday', header: 'Birthday' },
		{
			key: 'actions',
			header: 'Action',
			render: (client: Client) => (
				<div className="flex space-x-2">
					<PhoneButton phone={client.Phone || ''} name={client.Name || ''} />
					<SmsButton phone={client.Phone || ''} name={client.Name || ''} />
				</div>
			),
		},
	];

	return (
		<SearchableTable
			data={clients}
			searchKeys={['Name', 'Phone', 'Passport Number', 'Notes']}
			columns={columns}
			emptyMessage="No clients found. Check your Airtable connection."
			noResultsMessage="No matching clients found."
			searchPlaceholder="Search clients..."
			className="mt-6"
		/>
	);
};

// Main clients page component
export default function ClientsPage() {
	// State to hold clients data
	const [clients, setClients] = useState<Client[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Ref to track if data is being loaded
	const loadingRef = useRef(false);

	// Memoized fetch function to avoid recreating it on each render
	const fetchClients = useCallback(async () => {
		// Prevent concurrent fetches
		if (loadingRef.current) {
			console.log('Already loading clients data, skipping fetch');
			return;
		}

		try {
			loadingRef.current = true;
			console.log('Fetching clients data...');

			const data = await getClients();

			console.log(`Loaded ${data.length} clients`);
			setClients(data);
			setLoading(false);
		} catch (err) {
			console.error('Error loading clients:', err);
			setError('Failed to load clients data');
			setLoading(false);
		} finally {
			loadingRef.current = false;
		}
	}, []);

	// Fetch data on initial load
	useEffect(() => {
		// Skip if we already have data or if we're already loading
		if (clients.length > 0 || loadingRef.current) {
			return;
		}

		fetchClients();

		// No cleanup function needed since we're using loadingRef to prevent concurrent fetches
	}, [fetchClients, clients.length]);

	return (
		<PageWrapper title={<Heading>Clients</Heading>}>
			{loading ? <TableSkeleton rows={5} cols={5} className="mt-8" /> : error ? <div className="mt-8 text-red-500">{error}</div> : <ClientsTable clients={clients} />}
		</PageWrapper>
	);
}
