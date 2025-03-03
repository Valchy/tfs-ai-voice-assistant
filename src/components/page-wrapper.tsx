'use client';

import { Button } from '@/components/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface LoadingOverlayProps {
	isVisible: boolean;
}

// Reusable Loading Overlay component
function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
	const [visible, setVisible] = useState(false);

	// Manage animation with a slight delay for better UX
	useEffect(() => {
		if (isVisible) {
			setVisible(true);
		} else {
			// Add a small delay before hiding to ensure smooth animation
			const timer = setTimeout(() => {
				setVisible(false);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [isVisible]);

	if (!visible) return null;

	return (
		<div
			className={`fixed inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[1px] transition-opacity duration-300 ${
				isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
			}`}
		>
			<div className="flex items-center gap-3 rounded-lg bg-white p-5 shadow-lg">
				<svg className="h-5 w-5 animate-spin text-zinc-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				<p className="font-medium text-zinc-700">Refreshing data...</p>
			</div>
		</div>
	);
}

interface PageWrapperProps {
	children: React.ReactNode;
	title?: React.ReactNode; // Optional title component
}

export function PageWrapper({ children, title }: PageWrapperProps) {
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
			{/* Title area with refresh button */}
			<div className="flex items-end justify-between gap-4">
				{title}
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

			{/* Main content */}
			{children}

			{/* The loading overlay */}
			<LoadingOverlay isVisible={isLoading} />
		</div>
	);
}
