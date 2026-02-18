'use client';

import { ShellLayout } from '@/components/shell/shell-layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ShellLayout>{children}</ShellLayout>;
}
