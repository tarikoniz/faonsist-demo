import { create } from 'zustand';

type Module = 'messages' | 'erp' | 'crm' | 'stock' | null;

interface NavigationState {
    // State
    activeModule: Module;
    isSidebarOpen: boolean;
    isMobileMenuOpen: boolean;
    breadcrumbs: BreadcrumbItem[];

    // Actions
    setActiveModule: (module: Module) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleMobileMenu: () => void;
    setMobileMenuOpen: (open: boolean) => void;
    setBreadcrumbs: (items: BreadcrumbItem[]) => void;
    addBreadcrumb: (item: BreadcrumbItem) => void;
    clearBreadcrumbs: () => void;
}

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
    // Initial State
    activeModule: null,
    isSidebarOpen: true,
    isMobileMenuOpen: false,
    breadcrumbs: [],

    // Actions
    setActiveModule: (module: Module) => set({ activeModule: module }),

    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),

    toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

    setMobileMenuOpen: (open: boolean) => set({ isMobileMenuOpen: open }),

    setBreadcrumbs: (items: BreadcrumbItem[]) => set({ breadcrumbs: items }),

    addBreadcrumb: (item: BreadcrumbItem) =>
        set((state) => ({ breadcrumbs: [...state.breadcrumbs, item] })),

    clearBreadcrumbs: () => set({ breadcrumbs: [] }),
}));
