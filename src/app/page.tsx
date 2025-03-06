'use client';

// Disable static generation and ensure this page is dynamically rendered
export const dynamic = 'force-dynamic';

import { Badge } from '@/components/badge';
import { Heading, Subheading } from '@/components/heading';
import { NotesButton } from '@/components/notes-button';
import { PageWrapper } from '@/components/page-wrapper';
import { Select } from '@/components/select';
import { StatsSkeleton, TableSkeleton } from '@/components/skeleton';
import { Stat } from '@/components/stat';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { getCallerHistory } from '@/data';
import { formatPhoneNumber } from '@/lib/utils';
import { Suspense } from 'react';

// Map for Call Type styles
const callTypeStyles: Record<string, { color: 'zinc' | 'indigo' | 'amber' | 'red' | 'sky' | 'green' }> = {
	'No Action': { color: 'zinc' },
	'Question Asked': { color: 'indigo' },
	'Fraud Alert': { color: 'amber' },
	'Card Blocked': { color: 'red' },
	'Card Unblocked': { color: 'sky' },
	'Card Application': { color: 'green' },
};

// Separate data-fetching component
async function CallerHistoryContent() {
	const callerHistory = await getCallerHistory();
	console.log(`Rendering caller history with ${callerHistory.length} records`);

	return (
		<>
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
						<TableHeader>Phone</TableHeader>
						<TableHeader>Date</TableHeader>
						<TableHeader>Call Type</TableHeader>
						<TableHeader>Summary</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					{callerHistory.length > 0 ? (
						callerHistory.map(caller => (
							<TableRow key={caller.id} title={`Caller: ${caller.Name || '-'}`}>
								<TableCell>{caller.Name || '-'}</TableCell>
								<TableCell>{formatPhoneNumber(caller.Phone)}</TableCell>
								<TableCell>{caller.Date || '-'}</TableCell>
								<TableCell>
									<Badge color={callTypeStyles[caller['Call Type'] || '-']?.color || 'zinc'} className="px-3 py-1">
										{caller['Call Type'] || '-'}
									</Badge>
								</TableCell>
								<TableCell>
									<NotesButton notes={caller.Summary || ''} />
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={5} className="py-8 text-center text-zinc-500">
								No caller history found. Check your Airtable connection.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</>
	);
}

export default function Home() {
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

			<Suspense
				fallback={
					<>
						<StatsSkeleton />
						<Subheading className="mt-14">Recent calls</Subheading>
						<TableSkeleton rows={5} cols={1} />
					</>
				}
			>
				<CallerHistoryContent />
			</Suspense>
		</PageWrapper>
	);
}
