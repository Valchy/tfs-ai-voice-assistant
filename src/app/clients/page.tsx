// Disable static generation and ensure this page is dynamically rendered
export const dynamic = 'force-dynamic';

import { Heading } from '@/components/heading';
import { PageWrapper } from '@/components/page-wrapper';
import { PhoneButton } from '@/components/phone-button';
import { TableSkeleton } from '@/components/skeleton';
import { SmsButton } from '@/components/sms-button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { getClients } from '@/data';
import { formatPhoneNumber } from '@/lib/utils';
import { Suspense } from 'react';

// Separate data-fetching component
async function ClientsTableContent() {
	const clients = await getClients();
	console.log(`Rendering client page with ${clients.length} client records`);

	return (
		<div className="mt-8">
			<Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
				<TableHead>
					<TableRow>
						<TableHeader>Name</TableHeader>
						<TableHeader>Phone</TableHeader>
						<TableHeader>Email</TableHeader>
						<TableHeader>Date of Birth</TableHeader>
						<TableHeader>Actions</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					{clients.length > 0 ? (
						clients.map(client => (
							<TableRow key={client.id} title={`Client: ${client.Name || '-'}`}>
								<TableCell>{client.Name || '-'}</TableCell>
								<TableCell>{formatPhoneNumber(client.Phone)}</TableCell>
								<TableCell>{client.Email || '-'}</TableCell>
								<TableCell>{client['Date of birth']}</TableCell>
								<TableCell>
									<div className="flex space-x-2">
										<PhoneButton phone={client.Phone} name={client.Name} />
										<SmsButton phone={client.Phone} name={client.Name} />
									</div>
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
		</div>
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
