
"use client";

import { Header } from '@/components/custom/Header';
import type { ReactNode } from 'react';
import { useSip } from '@/contexts/SipContext'; // SipProvider import removed, useSip remains
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function ProtectedLayout({ children }: { children: ReactNode }) {
  const { connectionStatus, sipConfig } = useSip();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow access if already registered, or in a transient connecting/connected state (might lead to registered)
    const isAuthenticated = connectionStatus === 'registered';
    const isAttemptingConnection = connectionStatus === 'connecting' || connectionStatus === 'connected';

    if (!isAuthenticated && !isAttemptingConnection && pathname !== '/login') {
      // If there's no SIP config at all, definitely redirect.
      // Or if status is definitively disconnected/error/unregistered.
      if (!sipConfig || ['disconnected', 'error', 'unregistered', 'registration_failed'].includes(connectionStatus)) {
        router.push('/login');
      }
    }
  }, [connectionStatus, sipConfig, router, pathname]);

  // Show a loading indicator if connection is in progress and not yet registered
  // or if sipConfig is missing and we're about to redirect.
  // This prevents brief flashes of content.
  if ((!sipConfig && pathname !== '/login') || (['connecting', 'connected'].includes(connectionStatus) && connectionStatus !== 'registered')) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Chargement de la session...</p>
      </div>
    );
  }
  
  // If not registered and not attempting, and no config, redirect should have happened.
  // If we are here and still not registered, it means a redirect is likely pending or auth check failed.
  // We show children only if registered, or if on login page (which is outside this layout).
   if (connectionStatus !== 'registered' && pathname !== '/login') {
     // This case should ideally be covered by the loader and redirect logic.
     // If still here, it might be an edge case or waiting for redirect.
     return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Vérification de l'authentification...</p>
        </div>
     );
   }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="py-6 text-center text-xs text-muted-foreground border-t">
        © {new Date().getFullYear()} VidApp Connect. Tous droits réservés. Pour plus d'informations, visitez <a href="https://vidapp.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">vidapp.com</a> ou <a href="https://vidapp.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">vidapp.org</a>.
      </footer>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  // SipProvider is no longer here, it's in the root layout
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
