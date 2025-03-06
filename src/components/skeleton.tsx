'use client';

import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800', className)} {...props} />;
}

export function TableRowSkeleton({ cols, colWidths }: { cols: number; colWidths?: string[] }) {
	return (
		<tr className="border-b border-zinc-200 dark:border-zinc-800">
			{Array(cols)
				.fill(0)
				.map((_, i) => (
					<td key={i} className={cn('px-4 py-3', colWidths ? colWidths[i] : '')}>
						<Skeleton className="h-6 w-full" />
					</td>
				))}
		</tr>
	);
}

export function TableSkeleton({
	rows = 5,
	cols = 4,
	className = '',
	headers,
	colWidths,
}: {
	rows?: number;
	cols?: number;
	className?: string;
	headers?: string[];
	colWidths?: string[];
}) {
	return (
		<div className={cn('w-full overflow-auto', className)}>
			<table className="w-full caption-bottom">
				<thead>
					<tr className="border-b border-zinc-200 dark:border-zinc-800">
						{(headers || Array(cols).fill(0)).map((header, i) => (
							<th key={i} className={cn('px-4 py-3 text-left align-middle font-medium', colWidths ? colWidths[i] : '')}>
								<Skeleton className="h-6 w-24" />
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{Array(rows)
						.fill(0)
						.map((_, i) => (
							<TableRowSkeleton key={i} cols={headers?.length || cols} colWidths={colWidths} />
						))}
				</tbody>
			</table>
		</div>
	);
}

// Stats skeleton
export function StatsSkeleton() {
	return (
		<div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
			{Array(4)
				.fill(0)
				.map((_, i) => (
					<div key={i} className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
						<div className="flex items-center justify-between">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-12" />
						</div>
						<Skeleton className="mt-3 h-8 w-20" />
					</div>
				))}
		</div>
	);
}
