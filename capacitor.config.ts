import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'br.unicamp.ic.wounds',
	appName: 'wounds',
	webDir: 'dist',
	server: {
		androidScheme: 'https',
		cleartext: true
	},
	plugins: {
		CapacitorCookies: {
			enabled: true
		},
		Browser: {
			androidWindowTitle: "Authentication"
		}
	}
};

export default config;