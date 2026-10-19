import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** Where the API lives. Production/phone builds set EXPO_PUBLIC_API_URL to the deployed origin. */
export function getBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, '');

  if (Platform.OS === 'web' && typeof window !== 'undefined') return window.location.origin;

  // In development the dev server host is also the API host.
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host ?? 'localhost'}:8081`;
}
