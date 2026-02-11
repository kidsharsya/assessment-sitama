'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Layers, Users, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ============================================
// Admin Sidebar Component
// ============================================

interface AdminSidebarProps {
  isCollapsed: boolean;
}

const menuItems = [
  { id: 'kelola-sesi-ujian', label: 'Kelola Sesi Ujian', href: '/admin/kelola-sesi-ujian', icon: LayoutDashboard },
  { id: 'kelola-wawancara', label: 'Kelola Wawancara', href: '/admin/kelola-wawancara', icon: Users },
  { id: 'bank-soal', label: 'Bank Soal', href: '/admin/bank-soal', icon: BookOpen },
  { id: 'rubrik-wawancara', label: 'Rubrik Wawancara', href: '/admin/rubrik-wawancara', icon: Mic },
];

export function AdminSidebar({ isCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn('fixed left-0 top-0 z-40 h-screen bg-white text-slate-900 border-r border-slate-200 shadow-sm', 'transition-all duration-300 ease-in-out', isCollapsed ? 'w-[70px]' : 'w-64')}>
        {/* Logo */}
        <div className={cn('flex h-16 items-center border-b border-slate-200', isCollapsed ? 'justify-center px-2' : 'px-4')}>
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image src="/images/Logo.webp" alt="Logo" width={40} height={40} className="rounded-lg shrink-0" />
            <div className={cn('overflow-hidden transition-all duration-300', isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100')}>
              <h1 className="font-semibold text-sm whitespace-nowrap">Sitama Assessment</h1>
              <p className="text-xs text-slate-400 whitespace-nowrap">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            const linkContent = (
              <Link
                key={item.id}
                href={item.href}
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200', isActive ? 'bg-teal-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100', isCollapsed && 'justify-center px-2')}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className={cn('text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300', isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100')}>{item.label}</span>
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
