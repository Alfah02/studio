"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Phone, Users, History as HistoryIcon, Settings } from 'lucide-react'; // Renamed History to HistoryIcon

const navItems = [
  { href: '/calls', label: 'Calls', icon: Phone },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/history', label: 'History', icon: HistoryIcon },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-1 sm:space-x-2 md:space-x-4" aria-label="Main navigation">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href === '/calls' && pathname === '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out",
              isActive
                ? "bg-accent text-accent-foreground shadow-md"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
