'use client';

// Disable static generation and ensure this page is dynamically rendered
export const dynamic = 'force-dynamic';

import { Heading } from '@/components/heading';
import { PageWrapper } from '@/components/page-wrapper';
import { DataItem, SearchableTable } from '@/components/searchable-table';
import { TableSkeleton } from '@/components/skeleton';
import { getClients } from '@/data';
import { Suspense } from 'react';
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

// Client table component with search functionality
function ClientsTable({ clients }: { clients: Client[] }) {
	// Define columns for the table
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
}

// Separate data-fetching component
async function ClientsTableContent() {
	const clients = await getClients();
	console.log(`Rendering client page with ${clients.length} client records`);

	return <ClientsTable clients={clients} />;
}

export default function ClientsPage() {
	return (
		<PageWrapper title={<Heading>Clients</Heading>}>
			<Suspense fallback={<TableSkeleton rows={5} cols={1} className="mt-8" />}>
				<ClientsTableContent />
			</Suspense>
		</PageWrapper>
	);
}
