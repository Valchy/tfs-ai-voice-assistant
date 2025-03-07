import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getBaseUrl(req?: any) {
	return new URL(
		req ? req.url : typeof window !== 'undefined' ? window.location.origin : process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://app.valchy.ai',
	);
}

/**
 * Formats a card number by masking middle digits and adding spaces
 * @param cardNumber The raw card number string
 * @returns Formatted card number with first 4 and last 4 digits visible
 */
export function formatCardNumber(cardNumber: string): string {
	if (!cardNumber) return '-';
	// Remove any existing spaces and non-digit characters
	const cleaned = cardNumber.replace(/\D/g, '');

	// Check if we have at least 8 digits (4 for start, 4 for end)
	if (cleaned.length < 8) return cleaned;

	// Get first 4 and last 4 digits
	const first4 = cleaned.slice(0, 4);
	const last4 = cleaned.slice(-4);
	// Calculate number of middle digits to mask
	const middleLength = cleaned.length - 8;
	const maskedMiddle = '•'.repeat(middleLength);

	// Format with spaces
	return `${first4} ${maskedMiddle.match(/.{1,4}/g)?.join(' ') || ''} ${last4}`;
}

/**
 * Formats a phone number in international format
 * @param phone The raw phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
	if (!phone) return '-';
	// Remove any non-digit characters except plus sign
	const cleaned = phone.replace(/[^\d+]/g, '');

	// If it starts with a plus, format international number
	if (cleaned.startsWith('+')) {
		// Format: +XX XXX XXX XXX
		return cleaned.replace(/(\+\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
	}

	// If no plus, assume it's a local number and add spaces every 3 digits
	return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');
}
