'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

interface GoogleAuthProviderProps {
  children: React.ReactNode;
}

export function GoogleAuthProvider({ children }: GoogleAuthProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '870198175160-7caljlki7l34skfi9hjehskgbhl2mfc3.apps.googleusercontent.com';
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}

export const googleEnabled = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
