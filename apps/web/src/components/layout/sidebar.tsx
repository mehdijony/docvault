// apps/web/src/components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Files,
  FolderOpen,
  Users,
  Settings,
  BarChart2,
  ShieldCheck,
  Home,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Documents', href: '/documents', icon: Files },
  { name: 'Folders', href: '/folders', icon: FolderOpen },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Audit Log', href: '/audit', icon: ShieldCheck },
  { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Files className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">DocVault</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5',
                  isActive ? 'text-blue-600' : 'text-gray-500',
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Storage Usage */}
      <div className="p-4 border-t">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Storage Used</span>
            <span>2.1 GB / 5 GB</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: '42%' }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}