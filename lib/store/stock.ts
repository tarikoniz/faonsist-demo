import { create } from 'zustand';
import { InventoryItem, StockMovement, PurchaseOrder, Tender, StockAlert, Supplier } from '@/types/stock';
import apiClient from '@/lib/api-client';

interface StockState {
    // State
    inventory: InventoryItem[];
    movements: StockMovement[];
    purchaseOrders: PurchaseOrder[];
    tenders: Tender[];
    suppliers: Supplier[];
    alerts: StockAlert[];
    activeItem: InventoryItem | null;
    activeTender: Tender | null;
    isLoading: boolean;
    error: string | null;

    // Filter & Search
    searchQuery: string;
    categoryFilter: string | 'all';
    alertTypeFilter: string | 'all';

    // Actions - Inventory
    setInventory: (items: InventoryItem[]) => void;
    addInventoryItem: (item: InventoryItem) => void;
    updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => void;
    deleteInventoryItem: (itemId: string) => void;
    setActiveItem: (item: InventoryItem | null) => void;

    // Actions - Movements
    setMovements: (movements: StockMovement[]) => void;
    addMovement: (movement: StockMovement) => void;

    // Actions - Purchase Orders
    setPurchaseOrders: (orders: PurchaseOrder[]) => void;
    addPurchaseOrder: (order: PurchaseOrder) => void;
    updatePurchaseOrder: (orderId: string, updates: Partial<PurchaseOrder>) => void;

    // Actions - Tenders
    setTenders: (tenders: Tender[]) => void;
    addTender: (tender: Tender) => void;
    updateTender: (tenderId: string, updates: Partial<Tender>) => void;
    setActiveTender: (tender: Tender | null) => void;

    // Actions - Suppliers
    setSuppliers: (suppliers: Supplier[]) => void;
    addSupplier: (supplier: Supplier) => void;
    updateSupplier: (supplierId: string, updates: Partial<Supplier>) => void;

    // Actions - Alerts
    setAlerts: (alerts: StockAlert[]) => void;
    addAlert: (alert: StockAlert) => void;
    resolveAlert: (alertId: string) => void;

    // Search & Filter
    setSearchQuery: (query: string) => void;
    setCategoryFilter: (category: string | 'all') => void;
    setAlertTypeFilter: (type: string | 'all') => void;

    // Utilities
    clearError: () => void;
    setLoading: (loading: boolean) => void;

    // API Actions - Inventory
    fetchInventory: () => Promise<void>;
    createInventoryItem: (data: Partial<InventoryItem>) => Promise<any>;

    // API Actions - Suppliers
    fetchSuppliers: () => Promise<void>;
    createSupplierApi: (data: Partial<Supplier>) => Promise<any>;
    updateSupplierApi: (supplierId: string, data: Partial<Supplier>) => Promise<any>;
    deleteSupplierApi: (supplierId: string) => Promise<boolean>;

    // API Actions - Orders
    fetchOrders: () => Promise<void>;
    createOrderApi: (data: any) => Promise<any>;

    // API Actions - Tenders
    fetchTenders: () => Promise<void>;
}

export const useStockStore = create<StockState>((set) => ({
    // Initial State
    inventory: [],
    movements: [],
    purchaseOrders: [],
    tenders: [],
    suppliers: [],
    alerts: [],
    activeItem: null,
    activeTender: null,
    isLoading: false,
    error: null,
    searchQuery: '',
    categoryFilter: 'all',
    alertTypeFilter: 'all',

    // Inventory Actions
    setInventory: (items) => set({ inventory: items }),
    addInventoryItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
    updateInventoryItem: (itemId, updates) =>
        set((state) => ({
            inventory: state.inventory.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
        })),
    deleteInventoryItem: (itemId) =>
        set((state) => ({
            inventory: state.inventory.filter((i) => i.id !== itemId),
            activeItem: state.activeItem?.id === itemId ? null : state.activeItem,
        })),
    setActiveItem: (item) => set({ activeItem: item }),

    // Movement Actions
    setMovements: (movements) => set({ movements }),
    addMovement: (movement) => set((state) => ({ movements: [movement, ...state.movements] })),

    // Purchase Order Actions
    setPurchaseOrders: (orders) => set({ purchaseOrders: orders }),
    addPurchaseOrder: (order) => set((state) => ({ purchaseOrders: [...state.purchaseOrders, order] })),
    updatePurchaseOrder: (orderId, updates) =>
        set((state) => ({
            purchaseOrders: state.purchaseOrders.map((o) => (o.id === orderId ? { ...o, ...updates } : o)),
        })),

    // Tender Actions
    setTenders: (tenders) => set({ tenders }),
    addTender: (tender) => set((state) => ({ tenders: [...state.tenders, tender] })),
    updateTender: (tenderId, updates) =>
        set((state) => ({
            tenders: state.tenders.map((t) => (t.id === tenderId ? { ...t, ...updates } : t)),
        })),
    setActiveTender: (tender) => set({ activeTender: tender }),

    // Supplier Actions
    setSuppliers: (suppliers) => set({ suppliers }),
    addSupplier: (supplier) => set((state) => ({ suppliers: [...state.suppliers, supplier] })),
    updateSupplier: (supplierId, updates) =>
        set((state) => ({
            suppliers: state.suppliers.map((s) => (s.id === supplierId ? { ...s, ...updates } : s)),
        })),

    // Alert Actions
    setAlerts: (alerts) => set({ alerts }),
    addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
    resolveAlert: (alertId) =>
        set((state) => ({
            alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, isResolved: true, resolvedAt: new Date() } : a)),
        })),

    // Search & Filter
    setSearchQuery: (query) => set({ searchQuery: query }),
    setCategoryFilter: (category) => set({ categoryFilter: category }),
    setAlertTypeFilter: (type) => set({ alertTypeFilter: type }),

    // Utilities
    clearError: () => set({ error: null }),
    setLoading: (loading) => set({ isLoading: loading }),

    // API Actions - Inventory
    fetchInventory: async () => {
        set({ isLoading: true, error: null });
        const res = await apiClient.get<any[]>('/api/inventory');
        if (res.success) {
            set({ inventory: res.data || [], isLoading: false });
        } else {
            set({ error: res.error?.message || 'Envanter yüklenemedi', isLoading: false });
        }
    },

    createInventoryItem: async (data: Partial<InventoryItem>) => {
        set({ isLoading: true, error: null });
        const res = await apiClient.post<any>('/api/inventory', data);
        if (res.success && res.data) {
            set((state) => ({ inventory: [...state.inventory, res.data], isLoading: false }));
            return res.data;
        } else {
            set({ error: res.error?.message || 'Envanter öğesi oluşturulamadı', isLoading: false });
            return null;
        }
    },

    // API Actions - Suppliers
    fetchSuppliers: async () => {
        set({ isLoading: true, error: null });
        const res = await apiClient.get<any[]>('/api/suppliers');
        if (res.success) {
            set({ suppliers: res.data || [], isLoading: false });
        } else {
            set({ error: res.error?.message || 'Tedarikçiler yüklenemedi', isLoading: false });
        }
    },

    createSupplierApi: async (data: Partial<Supplier>) => {
        set({ isLoading: true, error: null });
        const res = await apiClient.post<any>('/api/suppliers', data);
        if (res.success && res.data) {
            set((state) => ({ suppliers: [...state.suppliers, res.data], isLoading: false }));
            return res.data;
        } else {
            set({ error: res.error?.message || 'Tedarikçi oluşturulamadı', isLoading: false });
            return null;
        }
    },

    updateSupplierApi: async (supplierId: string, data: Partial<Supplier>) => {
        set({ isLoading: true, error: null });
        const res = await apiClient.put<any>(`/api/suppliers/${supplierId}`, data);
        if (res.success && res.data) {
            set((state) => ({
                suppliers: state.suppliers.map((s) => (s.id === supplierId ? { ...s, ...res.data } : s)),
                isLoading: false,
            }));
            return res.data;
        } else {
            set({ error: res.error?.message || 'Tedarikçi güncellenemedi', isLoading: false });
            return null;
        }
    },

    deleteSupplierApi: async (supplierId: string) => {
        set({ isLoading: true, error: null });
        const res = await apiClient.delete<any>(`/api/suppliers/${supplierId}`);
        if (res.success) {
            set((state) => ({
                suppliers: state.suppliers.filter((s) => s.id !== supplierId),
                isLoading: false,
            }));
            return true;
        } else {
            set({ error: res.error?.message || 'Tedarikçi silinemedi', isLoading: false });
            return false;
        }
    },

    // API Actions - Orders
    fetchOrders: async () => {
        set({ isLoading: true, error: null });
        const res = await apiClient.get<any[]>('/api/orders');
        if (res.success) {
            set({ purchaseOrders: res.data || [], isLoading: false });
        } else {
            set({ error: res.error?.message || 'Siparişler yüklenemedi', isLoading: false });
        }
    },

    createOrderApi: async (data: any) => {
        set({ isLoading: true, error: null });
        const res = await apiClient.post<any>('/api/orders', data);
        if (res.success && res.data) {
            set((state) => ({ purchaseOrders: [...state.purchaseOrders, res.data], isLoading: false }));
            return res.data;
        } else {
            set({ error: res.error?.message || 'Sipariş oluşturulamadı', isLoading: false });
            return null;
        }
    },

    // API Actions - Tenders
    fetchTenders: async () => {
        set({ isLoading: true, error: null });
        const res = await apiClient.get<any[]>('/api/tenders');
        if (res.success) {
            set({ tenders: res.data || [], isLoading: false });
        } else {
            set({ error: res.error?.message || 'İhaleler yüklenemedi', isLoading: false });
        }
    },
}));
