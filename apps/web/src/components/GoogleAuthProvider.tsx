'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

interface GoogleAuthProviderProps {
  children: React.ReactNode;
}

export function GoogleAuthProvider({ children }: GoogleAuthProviderProps) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}>
      {children}
    </GoogleOAuthProvider>
  );
}

export const googleEnabled = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
