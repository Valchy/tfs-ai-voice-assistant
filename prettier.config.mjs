/** @type {import("prettier").Config} */
const config = {
	tailwindFunctions: ['clsx', 'tw'],
	plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],
	tailwindStylesheet: './src/styles/tailwind.css',
	trailingComma: 'all',
	semi: true,
	arrowParens: 'avoid',
	singleQuote: true,
	endOfLine: 'auto',
	quoteProps: 'preserve',
	useTabs: true,
	tabWidth: 4,
	printWidth: 180,
};

export default config;
