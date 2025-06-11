
import { Header } from '@/components/custom/Header';
import type { ReactNode } from 'react';
import { SipProvider } from '@/contexts/SipContext';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SipProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="py-6 text-center text-xs text-muted-foreground border-t">
          © {new Date().getFullYear()} VidApp Connect. Tous droits réservés. Pour plus d'informations, visitez <a href="https://vidapp.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">vidapp.com</a> ou <a href="https://vidapp.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">vidapp.org</a>.
        </footer>
      </div>
    </SipProvider>
  );
}
