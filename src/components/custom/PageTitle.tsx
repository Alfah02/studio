import type { ReactNode } from 'react';

interface PageTitleProps {
  children: ReactNode;
  className?: string;
}

export function PageTitle({ children, className }: PageTitleProps) {
  return (
    <h1 className={`text-3xl font-headline font-semibold text-foreground mb-6 ${className || ''}`}>
      {children}
    </h1>
  );
}
