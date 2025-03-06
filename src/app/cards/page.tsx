// Disable static generation and ensure this page is dynamically rendered
export const dynamic = 'force-dynamic';

import { Badge } from '@/components/badge';
import { Heading } from '@/components/heading';
import { PageWrapper } from '@/components/page-wrapper';
import { TableSkeleton } from '@/components/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { getCards } from '@/data';
import { formatCardNumber, formatPhoneNumber } from '@/lib/utils';
import { Suspense } from 'react';

// Define color types based on badge component
type BadgeColorType =
	| 'red'
	| 'orange'
	| 'amber'
	| 'yellow'
	| 'lime'
	| 'green'
	| 'emerald'
	| 'teal'
	| 'cyan'
	| 'sky'
	| 'blue'
	| 'indigo'
	| 'violet'
	| 'purple'
	| 'fuchsia'
	| 'pink'
	| 'rose'
	| 'zinc';

// Function to determine the appropriate color for status badges
function getStatusColor(status: string): BadgeColorType {
	switch (status) {
		case 'Active':
			return 'green';
		case 'Blocked':
			return 'red';
		case 'Frozen':
			return 'sky';
		default:
			return 'zinc';
	}
}

// Function to determine the appropriate color for type badges
function getTypeColor(type: string): BadgeColorType {
	switch (type) {
		case 'Debit':
			return 'indigo';
		case 'Credit':
			return 'amber';
		default:
			return 'zinc';
	}
}

// Separate data-fetching component
async function CardsTableContent() {
	const cards = await getCards();
	console.log(`Rendering cards page with ${cards.length} card records`);

	return (
		<div className="mt-8">
			<Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
				<TableHead>
					<TableRow>
						<TableHeader className="w-12">#</TableHeader>
						<TableHeader>Card Number</TableHeader>
						<TableHeader>Phone</TableHeader>
						<TableHeader>Status</TableHeader>
						<TableHeader>Type</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					{cards.length > 0 ? (
						cards.map((card, index) => (
							<TableRow key={card.id} title={`Card: ${card['Card Number']}`}>
								<TableCell>{index + 1}</TableCell>
								<TableCell>{formatCardNumber(card['Card Number'])}</TableCell>
								<TableCell>{formatPhoneNumber(card.Phone)}</TableCell>
								<TableCell>
									<Badge color={getStatusColor(card.Status)}>{card.Status}</Badge>
								</TableCell>
								<TableCell>
									<Badge color={getTypeColor(card.Type)}>{card.Type}</Badge>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={5} className="py-8 text-center text-zinc-500">
								No cards found. Check your Airtable connection.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

export default function CardsPage() {
	return (
		<PageWrapper title={<Heading>Cards</Heading>}>
			<Suspense fallback={<TableSkeleton rows={5} cols={5} className="mt-8" />}>
				<CardsTableContent />
			</Suspense>
		</PageWrapper>
	);
}
