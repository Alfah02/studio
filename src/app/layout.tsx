// No "use client" here, this is a Server Component

import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppClientProviders } from './providers'; // Import the new client provider wrapper

export const metadata: Metadata = {
  title: 'VidApp Connect',
  description: 'Appels audio et vidéo de haute qualité par VidApp',
  icons: {
    icon: '/vidapp-tab-logo.png', // Favicon standard
    shortcut: '/vidapp-tab-logo.png', // Pour les anciens navigateurs
    apple: '/apple-vidapp-icon.png', // Pour les appareils Apple (par ex. écran d'accueil)
    // Vous pouvez ajouter d'autres tailles ou types ici si nécessaire, par exemple :
    // { rel: 'icon', url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    // { rel: 'icon', url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppClientProviders> {/* Wrap children with the new client provider component */}
          {children}
        </AppClientProviders>
        <Toaster />
      </body>
    </html>
  );
}
