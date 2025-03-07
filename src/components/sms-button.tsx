'use client';

import { Alert, AlertActions, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { Dialog, DialogActions, DialogDescription, DialogTitle } from '@/components/dialog';
import { Text } from '@/components/text';
import { Textarea } from '@/components/textarea';
import { sendSmsMessage } from '@/data';
import { unformatPhoneNumber } from '@/lib/utils';
import { ChatBubbleLeftIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

// SMS button component
export function SmsButton({ phone, name }: { phone: string; name: string }) {
	const [isLoading, setIsLoading] = useState(false);
	const [isSmsOpen, setIsSmsOpen] = useState(false);
	const [message, setMessage] = useState('');
	const [alertState, setAlertState] = useState<{
		isOpen: boolean;
		message: string;
		isSuccess: boolean;
	}>({
		isOpen: false,
		message: '',
		isSuccess: false,
	});

	const handleSmsClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsSmsOpen(true);
	};

	const handleSendSms = async () => {
		if (!message.trim()) {
			setAlertState({
				isOpen: true,
				message: 'Please enter a message to send.',
				isSuccess: false,
			});
			return;
		}

		setIsSmsOpen(false);
		setIsLoading(true);

		try {
			// Unformat the phone number before sending to API
			const unformattedPhone = unformatPhoneNumber(phone);

			// Send the SMS message
			const success = await sendSmsMessage(unformattedPhone, message);

			if (success) {
				setAlertState({
					isOpen: true,
					message: `SMS to ${name} sent successfully.`,
					isSuccess: true,
				});
				// Clear the message after successful send
				setMessage('');
			} else {
				setAlertState({
					isOpen: true,
					message: `Failed to send SMS to ${name}.`,
					isSuccess: false,
				});
			}
		} catch (error) {
			console.error('SMS error:', error);
			setAlertState({
				isOpen: true,
				message: `Error sending SMS: ${error instanceof Error ? error.message : 'Unknown error'}`,
				isSuccess: false,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const closeSmsDialog = () => {
		setIsSmsOpen(false);
	};

	const closeAlertDialog = () => {
		setAlertState(prev => ({ ...prev, isOpen: false }));
	};

	return (
		<>
			<Button plain onClick={handleSmsClick} disabled={isLoading || !phone} title={phone ? `Send SMS to ${name}` : 'No phone number available'}>
				<ChatBubbleLeftIcon className="h-5 w-5 text-zinc-500 hover:text-zinc-700" />
			</Button>

			{/* SMS Dialog */}
			<Dialog open={isSmsOpen} onClose={closeSmsDialog}>
				<DialogTitle>Send SMS</DialogTitle>
				<DialogDescription>
					<div className="mb-2">
						Send a message to {name} at {phone}:
					</div>
					<Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your message here..." className="w-full" rows={3} />
				</DialogDescription>
				<DialogActions>
					<Button onClick={closeSmsDialog} plain>
						Cancel
					</Button>
					<Button onClick={handleSendSms} color="blue">
						Send
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
