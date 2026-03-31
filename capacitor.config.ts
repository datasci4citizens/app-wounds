import type { CapacitorConfig } from '@capacitor/cli';
import 'dotenv/config'; // Isso faz o Node ler o seu arquivo .env automaticamente!

const config: CapacitorConfig = {
  appId: 'br.unicamp.ic.cicatrizando',
  appName: 'Cicatrizando',
  webDir: 'out',
  plugins: {
    // Firebase Authentication plugin removed - now using react-oauth/google
  },
};

export default config;
