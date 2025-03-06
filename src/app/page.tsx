'use client';

// Disable static generation and ensure this page is dynamically rendered
export const dynamic = 'force-dynamic';

import { Badge } from '@/components/badge';
import { Heading, Subheading } from '@/components/heading';
import { PageWrapper } from '@/components/page-wrapper';
import { DataItem, SearchableTable } from '@/components/searchable-table';
import { Select } from '@/components/select';
import { StatsSkeleton, TableSkeleton } from '@/components/skeleton';
import { Stat } from '@/components/stat';
import { getCallerHistory } from '@/data';
import { Suspense } from 'react';

// Define caller type
export type Caller = DataItem & {
	Name?: string;
	Phone?: string;
	Date?: string;
	'Call Type'?: string;
	Notes?: string;
};

// CallerHistory component with search functionality
function CallerHistoryTable({ callerHistory }: { callerHistory: Caller[] }) {
	// Map for Call Type styles
	const callTypeStyles: Record<string, { color: 'zinc' | 'indigo' | 'amber' | 'sky' | 'green' }> = {
		'-': { color: 'zinc' },
		'Questions Asked': { color: 'indigo' },
		'Fraud Alert': { color: 'amber' },
		'Card Action': { color: 'sky' },
		'Card Application': { color: 'green' },
	};

	// Define columns for the table
	const columns = [
		{ key: 'Name', header: 'Name' },
		{ key: 'Phone', header: 'Phone' },
		{ key: 'Date', header: 'Date' },
		{
			key: 'Call Type',
			header: 'Call Type',
			render: (caller: Caller) => (
				<Badge color={callTypeStyles[caller['Call Type'] || '-']?.color || 'zinc'} className="px-3 py-1">
					{caller['Call Type'] || '-'}
				</Badge>
			),
		},
		{ key: 'Notes', header: 'Notes' },
	];

	return (
		<>
			<div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
				<Stat title="Total calls" value={callerHistory.length.toString()} change="+4.5%" />
				<Stat title="Average call duration" value="1m 34s" change="+2.1%" />
				<Stat title="Call completion rate" value="98%" change="+1.5%" />
				<Stat title="Customer satisfaction" value="4.7/5" change="+0.3%" />
			</div>

			<div className="mt-14 flex items-center justify-between">
				<Subheading>Recent calls</Subheading>
			</div>

			<SearchableTable
				data={callerHistory}
				searchKeys={['Name', 'Phone', 'Call Type', 'Notes']}
				columns={columns}
				emptyMessage="No caller history found. Check your Airtable connection."
				noResultsMessage="No matching calls found."
				searchPlaceholder="Search calls..."
				className="mt-4"
			/>
		</>
	);
}

// Separate data-fetching component
async function CallerHistoryContent() {
	const callerHistory = await getCallerHistory();
	return <CallerHistoryTable callerHistory={callerHistory} />;
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
