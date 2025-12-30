'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
  },
  {
    href: '/flashcards',
    label: 'Flashcards',
  },
  {
    href: '/study',
    label: 'Study',
  },
];

export function NavigationMenu() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-4 mr-4">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm transition-colors',
              isActive
                ? 'text-blue-400 font-medium border-b-2 border-blue-400 pb-1'
                : 'text-foreground hover:text-blue-400'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}


