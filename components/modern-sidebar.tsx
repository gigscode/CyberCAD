'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu, Home, BookOpen, CheckSquare, GraduationCap,
  Bell, Grid, Users, LogOut, FileText, Library,
  User, CreditCard, MessageSquare, ShieldCheck,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ModernSidebarProps {
  role?: 'learner' | 'admin';
}

const LEARNER_LINKS = [
  { href: '/dashboard',              label: 'Overview',       icon: Home },
  { href: '/dashboard/courses',      label: 'My Courses',     icon: BookOpen },
  { href: '/dashboard/tasks',        label: 'Tasks',          icon: CheckSquare },
  { href: '/dashboard/grades',       label: 'Grade & Review', icon: GraduationCap },
  { href: '/dashboard/notifications',label: 'Notifications',  icon: Bell },
  { href: '/dashboard/profile',      label: 'Profile',        icon: User },
];

const ADMIN_LINKS = [
  { href: '/admin',              label: 'Dashboard',       icon: Grid },
  { href: '/admin/courses',      label: 'Course Manager',  icon: Library },
  { href: '/admin/learners',     label: 'Learners',        icon: Users },
  { href: '/admin/submissions',  label: 'Submissions',     icon: CheckSquare },
  { href: '/admin/payments',     label: 'Payments',        icon: CreditCard },
  { href: '/admin/mentorship',   label: 'Mentorship Logs', icon: MessageSquare },
  { href: '/admin/audit-logs',   label: 'Audit Logs',      icon: FileText },
  { href: '/admin/profile',      label: 'Profile',         icon: User },
];

function SidebarContent({
  user,
  logout,
  pathname,
  onLinkClick,
}: {
  user: any;
  logout: () => void;
  pathname: string;
  onLinkClick?: () => void;
}) {
  const isSuperAdmin = user?.role === 'super-admin';
  const links = isSuperAdmin ? ADMIN_LINKS : LEARNER_LINKS;
  const profileHref = isSuperAdmin ? '/admin/profile' : '/dashboard/profile';

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-7 pt-7 pb-5">
        <Link href={isSuperAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200/60">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Sec<span className="text-indigo-600">quiz</span>
            </h1>
            <p className="text-[9px] uppercase tracking-[0.18em] font-semibold text-slate-400 leading-none">
              {isSuperAdmin ? 'Super Admin' : 'Academy'}
            </p>
          </div>
        </Link>
      </div>

      {/* Nav label */}
      <div className="px-7 mb-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
          {isSuperAdmin ? 'Management' : 'Main Menu'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href ||
            (link.href !== '/admin' && link.href !== '/dashboard' && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onLinkClick}
              className={cn(
                'flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200/60'
                  : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900'
              )}
            >
              <Icon className={cn(
                'w-[18px] h-[18px] shrink-0',
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
              )} />
              <span className="text-sm font-medium">{link.label}</span>
              {isActive && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 mt-2 border-t border-slate-100/80">
        <div className="flex items-center justify-between gap-2 bg-slate-50/80 rounded-2xl px-3 py-2.5 hover:bg-slate-100/80 transition-colors">
          <Link href={profileHref} onClick={onLinkClick} className="flex items-center gap-3 min-w-0">
            <Avatar className="w-9 h-9 shrink-0 border-2 border-white shadow-sm">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-indigo-50 text-indigo-600 font-semibold text-xs">
                {user?.firstName?.[0] ?? 'U'}{user?.lastName?.[0] ?? ''}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-slate-400 font-medium capitalize truncate">
                {isSuperAdmin ? 'Super Admin' : 'Learner'}
              </p>
            </div>
          </Link>
          <button
            onClick={logout}
            title="Sign out"
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModernSidebar({ role = 'learner' }: ModernSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const props = { user, logout, pathname };

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="w-10 h-10 bg-white/90 backdrop-blur border border-slate-200 rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all">
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-r-0 bg-white/95 backdrop-blur-xl w-72">
            <SidebarContent {...props} onLinkClick={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop floating sidebar */}
      <aside className="hidden lg:flex fixed left-5 top-5 bottom-5 w-[260px] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[28px] shadow-[0_8px_32px_rgba(15,23,42,0.08)] z-40 flex-col overflow-hidden">
        <SidebarContent {...props} />
      </aside>
    </>
  );
}
