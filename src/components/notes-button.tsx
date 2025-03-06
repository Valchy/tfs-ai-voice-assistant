'use client';

import { Button } from '@/components/button';
import { Dialog, DialogActions, DialogDescription, DialogTitle } from '@/components/dialog';
import { useState } from 'react';

export function NotesButton({ notes }: { notes: string }) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleNotesClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDialogOpen(true);
	};

	const closeDialog = () => {
		setIsDialogOpen(false);
	};

	return (
		<>
			<Button plain onClick={handleNotesClick} title="View call notes">
				<span className="text-sm text-zinc-400">View</span>
			</Button>

			{/* Notes Dialog */}
			<Dialog open={isDialogOpen} onClose={closeDialog}>
				<DialogTitle>Call Notes</DialogTitle>
				<DialogDescription>
					<div className="mb-2 max-h-[60vh] overflow-y-auto rounded-md border border-zinc-700 bg-zinc-800 p-4">
						{notes ? (
							<div className="whitespace-pre-wrap text-zinc-100">{notes}</div>
						) : (
							<div className="flex items-center justify-center p-6 text-center">
								<div className="rounded-lg bg-zinc-700/50 px-4 py-3 text-sm text-zinc-400 italic">No notes available for this call.</div>
							</div>
						)}
					</div>
				</DialogDescription>
				<DialogActions>
					<Button onClick={closeDialog} color="blue">
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
