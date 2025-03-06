import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getBaseUrl(req?: any) {
	return new URL(req ? req.url : process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://app.valchy.ai');
}
