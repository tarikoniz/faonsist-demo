'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { GlobalNav } from './global-nav';
import { useAuthStore } from '@/lib/store/auth';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ShellLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export function ShellLayout({ children, sidebar }: ShellLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  // Protected routes check
  useEffect(() => {
    const publicPaths = ['/', '/login', '/register'];
    const isPublicPath = publicPaths.includes(pathname || '');

    if (!isLoading && !isAuthenticated && !isPublicPath) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Public pages (landing, login, register)
  const publicPaths = ['/', '/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname || '');

  if (isPublicPath) {
    return <>{children}</>;
  }

  // Dashboard layout with navigation
  return (
    <div className="min-h-screen bg-background">
      {/* Global Navigation (64px left sidebar) */}
      <GlobalNav />

      {/* Main Content Area */}
      <div className="pl-16">
        {/* 3-column layout: Module Sidebar + Content */}
        <div className="flex h-screen">
          {/* Module Sidebar (280-320px) - Optional */}
          {sidebar && (
            <aside className="w-80 border-r border-border bg-surface/30 overflow-y-auto">
              {sidebar}
            </aside>
          )}

          {/* Content Area (Flexible width) */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
