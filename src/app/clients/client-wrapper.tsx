'use client';

import { Button } from '@/components/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LoadingOverlay } from './loading-overlay';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleRefresh = () => {
		setIsLoading(true);
		router.refresh();

		// Reset the loading state after a delay
		setTimeout(() => {
			setIsLoading(false);
		}, 1500);
	};

	return (
		<div className="relative">
			{/* Pass the refresh handler to the button */}
			<div className="flex items-end justify-between gap-4">
				{/* The first child is expected to be the heading */}
				{Array.isArray(children) ? children[0] : null}
				<div className="flex gap-2">
					<Button onClick={handleRefresh} className="-my-0.5" disabled={isLoading}>
						{isLoading ? (
							<div className="flex items-center">
								<svg className="mr-2 -ml-1 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Refreshing...
							</div>
						) : (
							'Refresh Data'
						)}
					</Button>
				</div>
			</div>

			{/* The rest of the children (the table) */}
			{Array.isArray(children) ? children.slice(1) : children}

			{/* The loading overlay */}
			<LoadingOverlay isVisible={isLoading} />
		</div>
	);
}
