'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Building2,
  TrendingUp,
  Package,
  Settings,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MODULE_NAMES, ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/lib/store/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: 'text-cyan-400',
    gradient: 'from-cyan-500/20 to-blue-500/20',
  },
  {
    id: 'messages',
    name: 'FaOn-Connect',
    icon: MessageSquare,
    href: ROUTES.MESSAGES,
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-indigo-500/20',
  },
  {
    id: 'erp',
    name: 'FaOn-Build',
    icon: Building2,
    href: ROUTES.ERP,
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    id: 'stock',
    name: 'FaOn-Supply',
    icon: Package,
    href: ROUTES.STOCK,
    color: 'text-orange-400',
    gradient: 'from-orange-500/20 to-red-500/20',
  },
  {
    id: 'crm',
    name: 'FaOn-Sales',
    icon: TrendingUp,
    href: ROUTES.CRM,
    color: 'text-green-400',
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
];

export function EnhancedGlobalNav() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        'fixed left-0 top-0 h-full transition-all duration-300 z-50',
        'bg-gradient-to-b from-surface/95 to-background/95',
        'backdrop-blur-xl border-r border-border/50',
        'shadow-2xl shadow-black/20',
        isExpanded ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex flex-col h-full p-4">
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-3 transition-all',
              !isExpanded && 'justify-center'
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-lg font-bold text-white">F</span>
            </div>
            {isExpanded && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">FaOnSisT</span>
                <span className="text-xs text-muted-foreground">Enterprise v2.0</span>
              </div>
            )}
          </Link>
          {isExpanded && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(false)}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Collapse button when collapsed */}
        {!isExpanded && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(true)}
            className="h-10 w-10 mb-4 mx-auto"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative overflow-hidden',
                  'hover:scale-[1.02] active:scale-[0.98]',
                  isActive
                    ? 'glass shadow-lg shadow-primary/20'
                    : 'hover:glass'
                )}
              >
                {/* Background gradient on hover */}
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity',
                    'group-hover:opacity-100',
                    item.gradient
                  )}
                />

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                )}

                {/* Icon */}
                <div className={cn('relative z-10', isActive ? item.color : 'text-muted-foreground group-hover:text-foreground')}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* Label */}
                {isExpanded && (
                  <span
                    className={cn(
                      'relative z-10 font-medium text-sm transition-colors',
                      isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  >
                    {item.name}
                  </span>
                )}

                {/* Glow effect on active */}
                {isActive && (
                  <div className={cn('absolute inset-0 bg-gradient-to-r blur-xl opacity-30', item.gradient)} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="space-y-2 pt-4 border-t border-border/50">
          {/* Settings */}
          <Link
            href={ROUTES.SETTINGS}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl transition-all',
              'text-muted-foreground hover:text-foreground hover:glass',
              pathname === ROUTES.SETTINGS && 'glass text-foreground'
            )}
          >
            <Settings className="h-5 w-5" />
            {isExpanded && <span className="text-sm font-medium">Ayarlar</span>}
          </Link>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl transition-all w-full',
                'hover:glass outline-none',
                isExpanded ? 'justify-start' : 'justify-center'
              )}
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white text-xs font-semibold">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              {isExpanded && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
                </div>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="end"
              className="w-56 glass border-border/50"
            >
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={ROUTES.PROFILE} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={ROUTES.SETTINGS} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Ayarlar</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Çıkış Yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
