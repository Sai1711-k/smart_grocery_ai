import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartgrocery.ai',
  appName: 'Smart Grocery AI',
  webDir: 'out',
  server: {
    url: 'https://smart-grocery-ai-beige.vercel.app',
    cleartext: true
  }
};

export default config;
