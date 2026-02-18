'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { ROUTES } from '@/lib/constants';

interface UseAuthOptions {
    requireAuth?: boolean;
    redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
    const { requireAuth = false, redirectTo = ROUTES.LOGIN } = options;
    const router = useRouter();
    const pathname = usePathname();

    const {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        register,
        updateUser,
        clearError,
    } = useAuthStore();

    useEffect(() => {
        if (requireAuth && !isLoading && !isAuthenticated) {
            const returnUrl = encodeURIComponent(pathname);
            router.push(`${redirectTo}?returnUrl=${returnUrl}`);
        }
    }, [requireAuth, isAuthenticated, isLoading, router, pathname, redirectTo]);

    const handleLogout = () => {
        logout();
        router.push(ROUTES.LOGIN);
    };

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout: handleLogout,
        register,
        updateUser,
        clearError,
    };
}
