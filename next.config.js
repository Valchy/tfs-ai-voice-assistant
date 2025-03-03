/** @type {import('next').NextConfig} */
const nextConfig = {
	// Disable compression for faster builds
	compress: false,

	// Add custom headers to all responses
	async headers() {
		return [
			{
				// Apply these headers to all routes
				source: '/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'no-store, max-age=0, must-revalidate',
					},
					{
						key: 'Pragma',
						value: 'no-cache',
					},
					{
						key: 'Expires',
						value: '0',
					},
				],
			},
		];
	},

	// Disable static exports
	output: 'standalone',
};

module.exports = nextConfig;
