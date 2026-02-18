import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@/lib/api-client';
import type {
    WarehouseExtended,
    Batch,
    RFQ,
    Quotation,
    WarehouseOperation,
    StockTransfer,
    CycleCount,
    GoodsReceipt,
    WarehouseMetrics,
    SupplierPerformance,
} from '@/types/procurement-warehouse';

interface ProcurementWarehouseState {
    // State - Warehouses
    warehouses: WarehouseExtended[];
    activeWarehouse: WarehouseExtended | null;

    // State - Batches
    batches: Batch[];
    activeBatch: Batch | null;

    // State - RFQ & Quotations
    rfqs: RFQ[];
    activeRFQ: RFQ | null;
    quotations: Quotation[];

    // State - Operations
    operations: WarehouseOperation[];
    activeOperation: WarehouseOperation | null;

    // State - Transfers
    transfers: StockTransfer[];
    activeTransfer: StockTransfer | null;

    // State - Cycle Counts
    cycleCounts: CycleCount[];
    activeCycleCount: CycleCount | null;

    // State - Goods Receipts
    goodsReceipts: GoodsReceipt[];
    activeReceipt: GoodsReceipt | null;

    // State - Analytics
    warehouseMetrics: WarehouseMetrics | null;
    supplierPerformances: SupplierPerformance[];

    // UI State
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    warehouseFilter: string | 'all';
    statusFilter: string | 'all';

    // Actions - Warehouses
    setWarehouses: (warehouses: WarehouseExtended[]) => void;
    addWarehouse: (warehouse: WarehouseExtended) => void;
    updateWarehouse: (warehouseId: string, updates: Partial<WarehouseExtended>) => void;
    deleteWarehouse: (warehouseId: string) => void;
    setActiveWarehouse: (warehouse: WarehouseExtended | null) => void;

    // Actions - Batches
    setBatches: (batches: Batch[]) => void;
    addBatch: (batch: Batch) => void;
    updateBatch: (batchId: string, updates: Partial<Batch>) => void;
    deleteBatch: (batchId: string) => void;
    setActiveBatch: (batch: Batch | null) => void;
    getBatchesByWarehouse: (warehouseId: string) => Batch[];
    getExpiringBatches: (days: number) => Batch[];

    // Actions - RFQ
    setRFQs: (rfqs: RFQ[]) => void;
    addRFQ: (rfq: RFQ) => void;
    updateRFQ: (rfqId: string, updates: Partial<RFQ>) => void;
    deleteRFQ: (rfqId: string) => void;
    setActiveRFQ: (rfq: RFQ | null) => void;

    // Actions - Quotations
    setQuotations: (quotations: Quotation[]) => void;
    addQuotation: (quotation: Quotation) => void;
    updateQuotation: (quotationId: string, updates: Partial<Quotation>) => void;
    getQuotationsByRFQ: (rfqId: string) => Quotation[];

    // Actions - Operations
    setOperations: (operations: WarehouseOperation[]) => void;
    addOperation: (operation: WarehouseOperation) => void;
    updateOperation: (operationId: string, updates: Partial<WarehouseOperation>) => void;
    setActiveOperation: (operation: WarehouseOperation | null) => void;
    getOperationsByWarehouse: (warehouseId: string) => WarehouseOperation[];

    // Actions - Transfers
    setTransfers: (transfers: StockTransfer[]) => void;
    addTransfer: (transfer: StockTransfer) => void;
    updateTransfer: (transferId: string, updates: Partial<StockTransfer>) => void;
    setActiveTransfer: (transfer: StockTransfer | null) => void;

    // Actions - Cycle Counts
    setCycleCounts: (counts: CycleCount[]) => void;
    addCycleCount: (count: CycleCount) => void;
    updateCycleCount: (countId: string, updates: Partial<CycleCount>) => void;
    setActiveCycleCount: (count: CycleCount | null) => void;

    // Actions - Goods Receipts
    setGoodsReceipts: (receipts: GoodsReceipt[]) => void;
    addGoodsReceipt: (receipt: GoodsReceipt) => void;
    updateGoodsReceipt: (receiptId: string, updates: Partial<GoodsReceipt>) => void;
    setActiveReceipt: (receipt: GoodsReceipt | null) => void;

    // Actions - Analytics
    setWarehouseMetrics: (metrics: WarehouseMetrics) => void;
    setSupplierPerformances: (performances: SupplierPerformance[]) => void;

    // API Actions
    fetchWarehouses: () => Promise<void>;
    createWarehouseApi: (data: any) => Promise<any>;
    updateWarehouseApi: (warehouseId: string, data: any) => Promise<any>;
    deleteWarehouseApi: (warehouseId: string) => Promise<boolean>;
    fetchPurchaseRequests: () => Promise<void>;
    createPurchaseRequestApi: (data: any) => Promise<any>;
    updatePurchaseRequestApi: (id: string, data: any) => Promise<any>;
    deletePurchaseRequestApi: (id: string) => Promise<boolean>;

    // Search & Filter
    setSearchQuery: (query: string) => void;
    setWarehouseFilter: (warehouseId: string | 'all') => void;
    setStatusFilter: (status: string | 'all') => void;

    // Utilities
    clearError: () => void;
    setLoading: (loading: boolean) => void;
    reset: () => void;
}

const initialState = {
    warehouses: [],
    activeWarehouse: null,
    batches: [],
    activeBatch: null,
    rfqs: [],
    activeRFQ: null,
    quotations: [],
    operations: [],
    activeOperation: null,
    transfers: [],
    activeTransfer: null,
    cycleCounts: [],
    activeCycleCount: null,
    goodsReceipts: [],
    activeReceipt: null,
    warehouseMetrics: null,
    supplierPerformances: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    warehouseFilter: 'all',
    statusFilter: 'all',
};

export const useProcurementWarehouseStore = create<ProcurementWarehouseState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // Warehouse Actions
            setWarehouses: (warehouses) => set({ warehouses }),
            addWarehouse: (warehouse) =>
                set((state) => ({ warehouses: [...state.warehouses, warehouse] })),
            updateWarehouse: (warehouseId, updates) =>
                set((state) => ({
                    warehouses: state.warehouses.map((w) =>
                        w.id === warehouseId ? { ...w, ...updates } : w
                    ),
                })),
            deleteWarehouse: (warehouseId) =>
                set((state) => ({
                    warehouses: state.warehouses.filter((w) => w.id !== warehouseId),
                    activeWarehouse:
                        state.activeWarehouse?.id === warehouseId ? null : state.activeWarehouse,
                })),
            setActiveWarehouse: (warehouse) => set({ activeWarehouse: warehouse }),

            // Batch Actions
            setBatches: (batches) => set({ batches }),
            addBatch: (batch) => set((state) => ({ batches: [...state.batches, batch] })),
            updateBatch: (batchId, updates) =>
                set((state) => ({
                    batches: state.batches.map((b) => (b.id === batchId ? { ...b, ...updates } : b)),
                })),
            deleteBatch: (batchId) =>
                set((state) => ({
                    batches: state.batches.filter((b) => b.id !== batchId),
                    activeBatch: state.activeBatch?.id === batchId ? null : state.activeBatch,
                })),
            setActiveBatch: (batch) => set({ activeBatch: batch }),
            getBatchesByWarehouse: (warehouseId) => {
                const { batches } = get();
                return batches.filter((b) => b.warehouseId === warehouseId);
            },
            getExpiringBatches: (days) => {
                const { batches } = get();
                const now = new Date();
                const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
                return batches.filter(
                    (b) =>
                        b.expiryDate &&
                        new Date(b.expiryDate) <= futureDate &&
                        new Date(b.expiryDate) > now
                );
            },

            // RFQ Actions
            setRFQs: (rfqs) => set({ rfqs }),
            addRFQ: (rfq) => set((state) => ({ rfqs: [...state.rfqs, rfq] })),
            updateRFQ: (rfqId, updates) =>
                set((state) => ({
                    rfqs: state.rfqs.map((r) => (r.id === rfqId ? { ...r, ...updates } : r)),
                })),
            deleteRFQ: (rfqId) =>
                set((state) => ({
                    rfqs: state.rfqs.filter((r) => r.id !== rfqId),
                    activeRFQ: state.activeRFQ?.id === rfqId ? null : state.activeRFQ,
                })),
            setActiveRFQ: (rfq) => set({ activeRFQ: rfq }),

            // Quotation Actions
            setQuotations: (quotations) => set({ quotations }),
            addQuotation: (quotation) =>
                set((state) => ({ quotations: [...state.quotations, quotation] })),
            updateQuotation: (quotationId, updates) =>
                set((state) => ({
                    quotations: state.quotations.map((q) =>
                        q.id === quotationId ? { ...q, ...updates } : q
                    ),
                })),
            getQuotationsByRFQ: (rfqId) => {
                const { quotations } = get();
                return quotations.filter((q) => q.rfqId === rfqId);
            },

            // Operation Actions
            setOperations: (operations) => set({ operations }),
            addOperation: (operation) =>
                set((state) => ({ operations: [...state.operations, operation] })),
            updateOperation: (operationId, updates) =>
                set((state) => ({
                    operations: state.operations.map((o) =>
                        o.id === operationId ? { ...o, ...updates } : o
                    ),
                })),
            setActiveOperation: (operation) => set({ activeOperation: operation }),
            getOperationsByWarehouse: (warehouseId) => {
                const { operations } = get();
                return operations.filter((o) => o.warehouseId === warehouseId);
            },

            // Transfer Actions
            setTransfers: (transfers) => set({ transfers }),
            addTransfer: (transfer) =>
                set((state) => ({ transfers: [...state.transfers, transfer] })),
            updateTransfer: (transferId, updates) =>
                set((state) => ({
                    transfers: state.transfers.map((t) =>
                        t.id === transferId ? { ...t, ...updates } : t
                    ),
                })),
            setActiveTransfer: (transfer) => set({ activeTransfer: transfer }),

            // Cycle Count Actions
            setCycleCounts: (counts) => set({ cycleCounts: counts }),
            addCycleCount: (count) =>
                set((state) => ({ cycleCounts: [...state.cycleCounts, count] })),
            updateCycleCount: (countId, updates) =>
                set((state) => ({
                    cycleCounts: state.cycleCounts.map((c) =>
                        c.id === countId ? { ...c, ...updates } : c
                    ),
                })),
            setActiveCycleCount: (count) => set({ activeCycleCount: count }),

            // Goods Receipt Actions
            setGoodsReceipts: (receipts) => set({ goodsReceipts: receipts }),
            addGoodsReceipt: (receipt) =>
                set((state) => ({ goodsReceipts: [...state.goodsReceipts, receipt] })),
            updateGoodsReceipt: (receiptId, updates) =>
                set((state) => ({
                    goodsReceipts: state.goodsReceipts.map((r) =>
                        r.id === receiptId ? { ...r, ...updates } : r
                    ),
                })),
            setActiveReceipt: (receipt) => set({ activeReceipt: receipt }),

            // Analytics Actions
            setWarehouseMetrics: (metrics) => set({ warehouseMetrics: metrics }),
            setSupplierPerformances: (performances) =>
                set({ supplierPerformances: performances }),

            // API Actions - Warehouses
            fetchWarehouses: async () => {
                set({ isLoading: true, error: null });
                const res = await apiClient.get<any[]>('/api/warehouses');
                if (res.success) {
                    set({ warehouses: res.data || [], isLoading: false });
                } else {
                    set({ error: res.error?.message || 'Depolar yüklenemedi', isLoading: false });
                }
            },

            createWarehouseApi: async (data: any) => {
                set({ isLoading: true, error: null });
                const res = await apiClient.post<any>('/api/warehouses', data);
                if (res.success && res.data) {
                    set((state) => ({ warehouses: [...state.warehouses, res.data], isLoading: false }));
                    return res.data;
                } else {
                    set({ error: res.error?.message || 'Depo oluşturulamadı', isLoading: false });
                    return null;
                }
            },

            updateWarehouseApi: async (warehouseId: string, data: any) => {
                set({ isLoading: true, error: null });
                const res = await apiClient.put<any>(`/api/warehouses/${warehouseId}`, data);
                if (res.success && res.data) {
                    set((state) => ({
                        warehouses: state.warehouses.map((w) =>
                            w.id === warehouseId ? { ...w, ...res.data } : w
                        ),
                        isLoading: false,
                    }));
                    return res.data;
                } else {
                    set({ error: res.error?.message || 'Depo güncellenemedi', isLoading: false });
                    return null;
                }
            },

            deleteWarehouseApi: async (warehouseId: string) => {
                set({ isLoading: true, error: null });
                const res = await apiClient.delete<any>(`/api/warehouses/${warehouseId}`);
                if (res.success) {
                    set((state) => ({
                        warehouses: state.warehouses.filter((w) => w.id !== warehouseId),
                        activeWarehouse:
                            state.activeWarehouse?.id === warehouseId ? null : state.activeWarehouse,
                        isLoading: false,
                    }));
                    return true;
                } else {
                    set({ error: res.error?.message || 'Depo silinemedi', isLoading: false });
                    return false;
                }
            },

            // API Actions - Purchase Requests
            fetchPurchaseRequests: async () => {
                set({ isLoading: true, error: null });
                const res = await apiClient.get<any[]>('/api/purchase-requests');
                if (res.success) {
                    set({ rfqs: res.data || [], isLoading: false });
                } else {
                    set({ error: res.error?.message || 'Satınalma talepleri yüklenemedi', isLoading: false });
                }
            },

            createPurchaseRequestApi: async (data: any) => {
                set({ isLoading: true, error: null });
                const res = await apiClient.post<any>('/api/purchase-requests', data);
                if (res.success && res.data) {
                    set((state) => ({ rfqs: [...state.rfqs, res.data], isLoading: false }));
                    return res.data;
                } else {
                    set({ error: res.error?.message || 'Satınalma talebi oluşturulamadı', isLoading: false });
                    return null;
                }
            },

            updatePurchaseRequestApi: async (id: string, data: any) => {
                set({ isLoading: true, error: null });
                const res = await apiClient.put<any>(`/api/purchase-requests/${id}`, data);
                if (res.success && res.data) {
                    set((state) => ({
                        rfqs: state.rfqs.map((r) => (r.id === id ? { ...r, ...res.data } : r)),
                        isLoading: false,
                    }));
                    return res.data;
                } else {
                    set({ error: res.error?.message || 'Satınalma talebi güncellenemedi', isLoading: false });
                    return null;
                }
            },

            deletePurchaseRequestApi: async (id: string) => {
                set({ isLoading: true, error: null });
                const res = await apiClient.delete<any>(`/api/purchase-requests/${id}`);
                if (res.success) {
                    set((state) => ({
                        rfqs: state.rfqs.filter((r) => r.id !== id),
                        activeRFQ: state.activeRFQ?.id === id ? null : state.activeRFQ,
                        isLoading: false,
                    }));
                    return true;
                } else {
                    set({ error: res.error?.message || 'Satınalma talebi silinemedi', isLoading: false });
                    return false;
                }
            },

            // Search & Filter
            setSearchQuery: (query) => set({ searchQuery: query }),
            setWarehouseFilter: (warehouseId) => set({ warehouseFilter: warehouseId }),
            setStatusFilter: (status) => set({ statusFilter: status }),

            // Utilities
            clearError: () => set({ error: null }),
            setLoading: (loading) => set({ isLoading: loading }),
            reset: () => set(initialState),
        }),
        {
            name: 'procurement-warehouse-storage',
            partialize: (state) => ({
                warehouses: state.warehouses,
                batches: state.batches,
                rfqs: state.rfqs,
                quotations: state.quotations,
                transfers: state.transfers,
                // Don't persist UI state
            }),
        }
    )
);
