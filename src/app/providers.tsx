
"use client"; // This is a Client Component

import type { ReactNode } from 'react';
import { SipProvider } from '@/contexts/SipContext';

export function AppClientProviders({ children }: { children: ReactNode }) {
  return (
    <SipProvider>
      {children}
    </SipProvider>
  );
}
