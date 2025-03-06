'use client';

import { Input } from '@/components/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import Fuse from 'fuse.js';
import { ReactNode, useEffect, useState } from 'react';

// Generic type for data items with id
export type DataItem = {
	id: string;
	[key: string]: any;
};

// Props for the SearchableTable component
export type SearchableTableProps<T extends DataItem> = {
	data: T[];
	searchKeys: string[];
	columns: {
		key: string;
		header: string;
		render?: (item: T) => ReactNode;
	}[];
	emptyMessage: string;
	noResultsMessage: string;
	searchPlaceholder?: string;
	className?: string;
	maxHeight?: string;
};

export function SearchableTable<T extends DataItem>({
	data,
	searchKeys,
	columns,
	emptyMessage,
	noResultsMessage,
	searchPlaceholder = 'Search...',
	className = '',
	maxHeight = '70vh',
}: SearchableTableProps<T>) {
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredItems, setFilteredItems] = useState<T[]>(data);

	// Update filtered items when search query or data changes
	useEffect(() => {
		if (searchQuery.trim() === '') {
			setFilteredItems(data);
		} else {
			// Configure Fuse.js for fuzzy search inside the effect
			const fuse = new Fuse(data, {
				keys: searchKeys,
				threshold: 0.3,
				includeScore: true,
			});
			const results = fuse.search(searchQuery);
			setFilteredItems(results.map(result => result.item));
		}
	}, [searchQuery, data, searchKeys]);

	return (
		<div className={`relative ${className}`}>
			<div className="mb-4 max-w-xs">
				<div className="relative">
					<Input type="search" placeholder={searchPlaceholder} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
				</div>
			</div>

			<div className={`overflow-y-auto rounded-lg border border-zinc-200 pl-2 dark:border-zinc-800`} style={{ maxHeight }}>
				<Table>
					<TableHead className="sticky top-0 z-10 bg-white shadow-sm dark:bg-zinc-900">
						<TableRow>
							{columns.map(column => (
								<TableHeader key={column.key}>{column.header}</TableHeader>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredItems.length > 0 ? (
							filteredItems.map(item => (
								<TableRow key={item.id}>
									{columns.map(column => (
										<TableCell key={`${item.id}-${column.key}`}>{column.render ? column.render(item) : item[column.key] || '-'}</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="py-8 text-center text-zinc-500">
									{data.length === 0 ? emptyMessage : noResultsMessage}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
