import type { CapacitorConfig } from '@capacitor/cli';
import 'dotenv/config'; // Isso faz o Node ler o seu arquivo .env automaticamente!

const config: CapacitorConfig = {
  appId: 'br.unicamp.ic.cicatrizando',
  appName: 'Cicatrizando',
  webDir: 'out',
  plugins: {
    SocialLogin: {
      google: {
        // Web Client ID for OAuth - same as NEXT_PUBLIC_GOOGLE_CLIENT_ID
        webClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      },
    },
  },
};

export default config;
