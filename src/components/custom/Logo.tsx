import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/calls" className="flex items-center space-x-2 transition-opacity hover:opacity-80" aria-label="VidApp Connect Home">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-accent">
        <rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M17 9L21 7V17L17 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="12" r="2" fill="currentColor"/>
      </svg>
      <h1 className="text-2xl font-headline font-bold">
        <span className="text-accent">Vid</span><span className="text-foreground">App</span> <span className="text-muted-foreground">Connect</span>
      </h1>
    </Link>
  );
}
