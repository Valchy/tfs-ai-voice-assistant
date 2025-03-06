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
 * Formats a card number by adding a space every 4 digits
 * @param cardNumber The raw card number string
 * @returns Formatted card number with spaces
 */
export function formatCardNumber(cardNumber: string): string {
	if (!cardNumber) return '-';
	// Remove any existing spaces and non-digit characters
	const cleaned = cardNumber.replace(/\D/g, '');
	// Add a space every 4 characters
	return cleaned.replace(/(.{4})/g, '$1 ').trim();
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
