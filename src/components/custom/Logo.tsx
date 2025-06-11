import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/calls" className="flex items-center space-x-2 transition-opacity hover:opacity-80" aria-label="VidApp Connect Home">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-accent">
        <path d="M4 8C4 5.79086 5.79086 4 8 4H16C18.2091 4 20 5.79086 20 8V16C20 18.2091 18.2091 20 16 20H8C5.79086 20 4 18.2091 4 16V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <h1 className="text-2xl font-headline font-bold">
        <span className="text-accent">Vid</span><span className="text-foreground">App</span> <span className="text-muted-foreground">Connect</span>
      </h1>
    </Link>
  );
}
