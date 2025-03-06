import type { Metadata } from 'next';
import type React from 'react';

import '@/styles/tailwind.css';
import { ApplicationLayout } from './application-layout';

export const metadata: Metadata = {
	title: {
		template: 'Valchy AI',
		default: 'Valchy AI',
	},
	description: 'Valchy AI is a platform for managing your calls and leads.',
	icons: {
		icon: '/favicon.png',
	},
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="text-zinc-950 antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950">
			<head>
				<link rel="preconnect" href="https://rsms.me/" />
				<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
			</head>
			<body>
				<ApplicationLayout>{children}</ApplicationLayout>
			</body>
		</html>
	);
}
