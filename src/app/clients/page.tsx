// Disable static generation and ensure this page is dynamically rendered
export const dynamic = 'force-dynamic';

import { Heading } from '@/components/heading';
import { PageWrapper } from '@/components/page-wrapper';
import { TableSkeleton } from '@/components/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { getClients } from '@/data';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PhoneButton } from './phone-button';

export const metadata: Metadata = {
	title: 'Clients',
};

// Separate data-fetching component
async function ClientsTableContent() {
	const clients = await getClients();
	console.log(`Rendering client page with ${clients.length} client records`);

	return (
		<Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
			<TableHead>
				<TableRow>
					<TableHeader>Name</TableHeader>
					<TableHeader>Phone Number</TableHeader>
					<TableHeader>Passport Number</TableHeader>
					<TableHeader>Card Status</TableHeader>
					<TableHeader>Notes</TableHeader>
					<TableHeader>Action</TableHeader>
				</TableRow>
			</TableHead>
			<TableBody>
				{clients.length > 0 ? (
					clients.map(client => (
						<TableRow key={client.id} title={`Client: ${client.Name || '-'}`}>
							<TableCell>{client.Name || '-'}</TableCell>
							<TableCell>{client.Phone || '-'}</TableCell>
							<TableCell>{client.PassportNumber || '-'}</TableCell>
							<TableCell>{client.CardStatus?.join(', ') || '-'}</TableCell>
							<TableCell className="max-w-xs truncate">{client.Notes || '-'}</TableCell>
							<TableCell>
								<PhoneButton phone={client.Phone} name={client.Name} />
							</TableCell>
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell colSpan={6} className="py-8 text-center text-zinc-500">
							No clients found. Check your Airtable connection.
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
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
