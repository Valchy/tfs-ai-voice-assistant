import { Heading } from '@/components/heading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { getCallerHistory } from '@/data';
import type { Metadata } from 'next';
import { ClientWrapper } from './client-wrapper';

export const metadata: Metadata = {
	title: 'Clients',
};

export default async function ClientsPage() {
	const callerHistory = await getCallerHistory();

	console.log(`Rendering client page with ${callerHistory.length} history records`);

	return (
		<ClientWrapper>
			<Heading>Clients</Heading>

			<Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
				<TableHead>
					<TableRow>
						<TableHeader>Name</TableHeader>
						<TableHeader>Phone Number</TableHeader>
						<TableHeader>Call Date</TableHeader>
						<TableHeader>Notes</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					{callerHistory.length > 0 ? (
						callerHistory.map(caller => (
							<TableRow key={caller.id} href={`/clients/${caller.id}`} title={`Caller: ${caller.Name || '-'}`}>
								<TableCell>{caller.Name || '-'}</TableCell>
								<TableCell>{caller.Phone || '-'}</TableCell>
								<TableCell>{caller.Date || '-'}</TableCell>
								<TableCell className="max-w-xs truncate">{caller.Notes || '-'}</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={6} className="py-8 text-center text-zinc-500">
								No caller history found. Check your Airtable connection.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</ClientWrapper>
	);
}
