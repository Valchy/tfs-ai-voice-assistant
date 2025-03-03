import { Stat } from '@/app/stat';
import { Heading, Subheading } from '@/components/heading';
import { PageWrapper } from '@/components/page-wrapper';
import { Select } from '@/components/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { getCallerHistory } from '@/data';

export default async function Home() {
	let callerHistory = await getCallerHistory();

	return (
		<PageWrapper title={<Heading>Good afternoon, Valeri</Heading>}>
			<div className="mt-8 flex items-end justify-between">
				<Subheading>Overview</Subheading>
				<div>
					<Select name="period">
						<option value="last_week">Last week</option>
						<option value="last_two">Last two weeks</option>
						<option value="last_month">Last month</option>
						<option value="last_quarter">Last quarter</option>
					</Select>
				</div>
			</div>

			<div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
				<Stat title="Total calls" value={callerHistory.length.toString()} change="+4.5%" />
				<Stat title="Average call duration" value="3m 24s" change="+2.1%" />
				<Stat title="Call completion rate" value="94%" change="+1.5%" />
				<Stat title="Customer satisfaction" value="4.7/5" change="+0.3%" />
			</div>

			<Subheading className="mt-14">Recent calls</Subheading>
			<Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
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
							<TableCell colSpan={4} className="py-8 text-center text-zinc-500">
								No caller history found. Check your Airtable connection.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</PageWrapper>
	);
}
