'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Building2,
  Users,
  Package,
  Settings,
  LogOut,
  User,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MODULE_NAMES, ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/lib/store/auth';
import { useNavigationStore } from '@/lib/store/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
    href: ROUTES.HOME,
    badge: null,
  },
  {
    id: 'messages',
    name: MODULE_NAMES.MESSAGES,
    icon: MessageSquare,
    href: ROUTES.MESSAGES,
    badge: 3,
  },
  {
    id: 'erp',
    name: MODULE_NAMES.ERP,
    icon: Building2,
    href: ROUTES.ERP,
    badge: 4,
  },
  {
    id: 'stock',
    name: MODULE_NAMES.STOCK,
    icon: Package,
    href: ROUTES.STOCK,
    badge: 1,
  },
  {
    id: 'crm',
    name: MODULE_NAMES.CRM,
    icon: Users,
    href: ROUTES.CRM,
    badge: 4,
  },
  {
    id: 'reports',
    name: 'Raporlar',
    icon: FileText,
    href: '/reports',
    badge: null,
  },
];

export function GlobalNav() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { setActiveModule } = useNavigationStore();

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId as any);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-[#0a0e1a] border-r border-[#1e2738] flex flex-col z-50">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#5B9FED] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-white">F</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-white leading-tight">FaOnSisT</h1>
          <p className="text-[10px] text-gray-500 leading-tight">Enterprise v2.0</p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => handleModuleClick(item.id)}
              className={cn(
                'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all',
                isActive
                  ? 'bg-[#5B9FED] text-white'
                  : 'text-gray-300 hover:bg-[#1e2738]'
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="font-normal text-[13px] truncate">
                  {item.name}
                </span>
              </div>
              {item.badge && item.badge > 0 && (
                <Badge
                  className={cn(
                    'flex-shrink-0 h-5 min-w-[20px] px-1.5 text-[10px] font-semibold rounded-full',
                    isActive
                      ? 'bg-white text-[#5B9FED]'
                      : 'bg-[#ef4444] text-white border-0'
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-3 border-t border-[#1e2738] space-y-1">
        {/* Settings */}
        <Link
          href={ROUTES.SETTINGS}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
            pathname === ROUTES.SETTINGS
              ? 'bg-[#1e2738] text-white'
              : 'text-gray-400 hover:bg-[#1e2738] hover:text-gray-300'
          )}
        >
          <Settings className="h-[18px] w-[18px]" />
          <span className="font-normal text-[13px]">Ayarlar</span>
        </Link>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full outline-none">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1e2738] transition-all cursor-pointer">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-[#5B9FED] to-[#8b5cf6] text-white text-xs font-semibold">
                  {user?.name ? getInitials(user.name) : 'HA'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[13px] font-medium text-white truncate leading-tight">
                  {user?.name || 'Hafsar Asılsoy'}
                </p>
                <p className="text-[11px] text-gray-500 truncate leading-tight">
                  {user?.email || 'hafsar@faonsist.com'}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56 mb-2 ml-3 bg-[#1e2738] border-[#2d3748]">
            <DropdownMenuLabel className="text-gray-300">Hesabım</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#2d3748]" />
            <DropdownMenuItem asChild className="text-gray-300 focus:bg-[#2d3748] focus:text-white">
              <Link href={ROUTES.PROFILE} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-gray-300 focus:bg-[#2d3748] focus:text-white">
              <Link href={ROUTES.SETTINGS} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Ayarlar</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#2d3748]" />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-400 focus:bg-[#2d3748] focus:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Çıkış Yap</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
