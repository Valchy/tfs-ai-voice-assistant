'use client';

import { Button } from '@/components/button';
import { initiateVoiceflowCall } from '@/data';
import { PhoneIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

// Phone button component
export function PhoneButton({ phone, name }: { phone: string; name: string }) {
	const [isLoading, setIsLoading] = useState(false);

	const handleCallClick = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		// Show confirmation dialog
		const confirmCall = window.confirm(`Are you sure you want to call ${name} at ${phone}?`);
		if (!confirmCall) return;

		setIsLoading(true);
		try {
			// Make the call to the API using the centralized function
			const success = await initiateVoiceflowCall(phone);

			if (success) {
				alert(`Call to ${name} initiated successfully.`);
			} else {
				alert(`Failed to initiate call to ${name}.`);
			}
		} catch (error) {
			console.error('Call error:', error);
			alert(`Error initiating call: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button plain onClick={handleCallClick} disabled={isLoading || !phone} title={phone ? `Call ${name}` : 'No phone number available'}>
			<PhoneIcon className="h-5 w-5 text-zinc-500 hover:text-zinc-700" />
		</Button>
	);
}
