'use client';

import { Alert, AlertActions, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { Dialog, DialogActions, DialogDescription, DialogTitle } from '@/components/dialog';
import { Text } from '@/components/text';
import { initiateVoiceflowCall } from '@/data';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

// Alert button component for fraud alerts
export function AlertButton({ phone, card }: { phone: string; card: string }) {
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

	const handleAlertClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsConfirmOpen(true);
	};

	const handleConfirmAlert = async () => {
		setIsConfirmOpen(false);
		setIsLoading(true);

		try {
			// Make the call to the API using the centralized function
			const success = await initiateVoiceflowCall({ phoneNumber: phone, card });

			if (success) {
				setAlertState({
					isOpen: true,
					message: `Fraud alert call to ${phone} initiated successfully.`,
					isSuccess: true,
				});
			} else {
				setAlertState({
					isOpen: true,
					message: `Failed to initiate fraud alert call to ${phone}.`,
					isSuccess: false,
				});
			}
		} catch (error) {
			console.error('Call error:', error);
			setAlertState({
				isOpen: true,
				message: `Error initiating fraud alert call: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
			<Button plain onClick={handleAlertClick} disabled={isLoading || !phone} title={phone ? `Send fraud alert call to ${phone}` : 'No phone number available'}>
				<ExclamationTriangleIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
			</Button>

			{/* Confirmation Dialog */}
			<Dialog open={isConfirmOpen} onClose={closeConfirmDialog}>
				<DialogTitle>Confirm Fraud Alert Call</DialogTitle>
				<DialogDescription>
					Are you sure you want to send a <span className="font-bold text-red-600">fraud alert</span> call to {phone}?
				</DialogDescription>
				<DialogActions>
					<Button onClick={closeConfirmDialog} plain>
						Cancel
					</Button>
					<Button onClick={handleConfirmAlert} color="red">
						Send Alert
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
