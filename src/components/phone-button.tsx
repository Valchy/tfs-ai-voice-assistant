'use client';

import { Alert, AlertActions, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { Dialog, DialogActions, DialogDescription, DialogTitle } from '@/components/dialog';
import { Text } from '@/components/text';
import { initiateVoiceflowCall } from '@/data';
import { PhoneIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

// Phone button component
export function PhoneButton({ phone, name }: { phone: string; name: string }) {
	const [isLoading, setIsLoading] = useState(false);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [alertState, setAlertState] = useState<{
		isOpen: boolean;
		message: string;
		isSuccess: boolean;
	}>({
		isOpen: false,
		message: '',
		isSuccess: false,
	});

	const handleCallClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsConfirmOpen(true);
	};

	const handleConfirmCall = async () => {
		setIsConfirmOpen(false);
		setIsLoading(true);

		try {
			// Make the call to the API using the centralized function with explicit
			const success = await initiateVoiceflowCall({ phoneNumber: phone, card: '' });

			if (success) {
				setAlertState({
					isOpen: true,
					message: `Call to ${name} initiated successfully.`,
					isSuccess: true,
				});
			} else {
				setAlertState({
					isOpen: true,
					message: `Failed to initiate call to ${name}.`,
					isSuccess: false,
				});
			}
		} catch (error) {
			console.error('Call error:', error);
			setAlertState({
				isOpen: true,
				message: `Error initiating call: ${error instanceof Error ? error.message : 'Unknown error'}`,
				isSuccess: false,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const closeConfirmDialog = () => {
		setIsConfirmOpen(false);
	};

	const closeAlertDialog = () => {
		setAlertState(prev => ({ ...prev, isOpen: false }));
	};

	return (
		<>
			<Button plain onClick={handleCallClick} disabled={isLoading || !phone} title={phone ? `Call ${name}` : 'No phone number available'}>
				<PhoneIcon className="h-5 w-5 text-zinc-500 hover:text-zinc-700" />
			</Button>

			{/* Confirmation Dialog */}
			<Dialog open={isConfirmOpen} onClose={closeConfirmDialog}>
				<DialogTitle>Confirm Call</DialogTitle>
				<DialogDescription>
					Are you sure you want to call {name} at {phone}?
				</DialogDescription>
				<DialogActions>
					<Button onClick={closeConfirmDialog} plain>
						Cancel
					</Button>
					<Button onClick={handleConfirmCall} color="blue">
						Call
					</Button>
				</DialogActions>
			</Dialog>

			{/* Success/Error Alert */}
			<Alert open={alertState.isOpen} onClose={closeAlertDialog}>
				<AlertTitle>{alertState.isSuccess ? 'Success' : 'Error'}</AlertTitle>
				<Text>{alertState.message}</Text>
				<AlertActions>
					<Button onClick={closeAlertDialog} color={alertState.isSuccess ? 'green' : 'red'}>
						OK
					</Button>
				</AlertActions>
			</Alert>
		</>
	);
}
