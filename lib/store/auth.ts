import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Role, UserStatus } from '@/types';
import { API_BASE_URL, AUTH_TOKEN_KEY, AUTH_REFRESH_KEY } from '@/lib/constants';

interface AuthState {
    // State
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    refreshAccessToken: () => Promise<void>;
    updateUser: (user: Partial<User>) => void;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    department?: string;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Initial State
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Actions
            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });

                try {
                    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });

                    const data = await res.json();

                    if (!res.ok || !data.success) {
                        throw new Error(data.error?.message || 'Giriş başarısız');
                    }

                    // Token'ları localStorage'a da kaydet (API client icin)
                    if (typeof window !== 'undefined') {
                        localStorage.setItem(AUTH_TOKEN_KEY, data.data.token);
                        localStorage.setItem(AUTH_REFRESH_KEY, data.data.refreshToken);
                    }

                    const apiUser = data.data.user;
                    const user: User = {
                        id: apiUser.id,
                        name: apiUser.name,
                        email: apiUser.email,
                        phone: apiUser.phone,
                        avatar: apiUser.avatar,
                        role: (apiUser.role as Role) || Role.EMPLOYEE,
                        department: apiUser.department,
                        status: UserStatus.ONLINE,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };

                    set({
                        user,
                        token: data.data.token,
                        refreshToken: data.data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Giriş başarısız',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            register: async (data: RegisterData) => {
                set({ isLoading: true, error: null });

                try {
                    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: data.name,
                            email: data.email,
                            password: data.password,
                            confirmPassword: data.confirmPassword || data.password,
                            department: data.department,
                        }),
                    });

                    const result = await res.json();

                    if (!res.ok || !result.success) {
                        throw new Error(result.error?.message || 'Kayıt başarısız');
                    }

                    // Token'ları localStorage'a kaydet
                    if (typeof window !== 'undefined') {
                        localStorage.setItem(AUTH_TOKEN_KEY, result.data.token);
                        localStorage.setItem(AUTH_REFRESH_KEY, result.data.refreshToken);
                    }

                    const apiUser = result.data.user;
                    const user: User = {
                        id: apiUser.id,
                        name: apiUser.name,
                        email: apiUser.email,
                        phone: apiUser.phone,
                        role: (apiUser.role as Role) || Role.EMPLOYEE,
                        department: apiUser.department,
                        status: UserStatus.ONLINE,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };

                    set({
                        user,
                        token: result.data.token,
                        refreshToken: result.data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Kayıt başarısız',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            logout: () => {
                // Token'ları localStorage'dan sil
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                    localStorage.removeItem(AUTH_REFRESH_KEY);
                }

                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            refreshAccessToken: async () => {
                const { refreshToken } = get();

                if (!refreshToken) {
                    get().logout();
                    return;
                }

                try {
                    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    });

                    const data = await res.json();

                    if (!res.ok || !data.success) {
                        throw new Error('Token yenileme basarisiz');
                    }

                    // Yeni token'ları kaydet
                    if (typeof window !== 'undefined') {
                        localStorage.setItem(AUTH_TOKEN_KEY, data.data.token);
                        localStorage.setItem(AUTH_REFRESH_KEY, data.data.refreshToken);
                    }

                    set({
                        token: data.data.token,
                        refreshToken: data.data.refreshToken,
                    });
                } catch (error) {
                    get().logout();
                }
            },

            updateUser: (userData: Partial<User>) => {
                const { user } = get();
                if (user) {
                    set({ user: { ...user, ...userData, updatedAt: new Date() } });
                }
            },

            clearError: () => set({ error: null }),

            setLoading: (loading: boolean) => set({ isLoading: loading }),
        }),
        {
            name: 'faonsist-auth',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
