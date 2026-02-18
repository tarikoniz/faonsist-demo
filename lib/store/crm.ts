import { create } from 'zustand';
import { Lead, Customer, Deal, Activity, LeadStatus, DealStage } from '@/types/crm';
import apiClient from '@/lib/api-client';

interface CrmState {
    // State
    leads: Lead[];
    customers: Customer[];
    deals: Deal[];
    activities: Activity[];
    activeLead: Lead | null;
    activeCustomer: Customer | null;
    activeDeal: Deal | null;
    isLoading: boolean;
    error: string | null;

    // Filter & Search
    searchQuery: string;
    leadStatusFilter: LeadStatus | 'all';
    dealStageFilter: DealStage | 'all';

    // Actions - Leads
    setLeads: (leads: Lead[]) => void;
    addLead: (lead: Lead) => void;
    updateLead: (leadId: string, updates: Partial<Lead>) => void;
    deleteLead: (leadId: string) => void;
    setActiveLead: (lead: Lead | null) => void;
    convertLeadToCustomer: (leadId: string, customerId: string) => void;

    // Actions - Customers
    setCustomers: (customers: Customer[]) => void;
    addCustomer: (customer: Customer) => void;
    updateCustomer: (customerId: string, updates: Partial<Customer>) => void;
    deleteCustomer: (customerId: string) => void;
    setActiveCustomer: (customer: Customer | null) => void;

    // Actions - Deals
    setDeals: (deals: Deal[]) => void;
    addDeal: (deal: Deal) => void;
    updateDeal: (dealId: string, updates: Partial<Deal>) => void;
    deleteDeal: (dealId: string) => void;
    setActiveDeal: (deal: Deal | null) => void;
    moveDealToStage: (dealId: string, stage: DealStage) => void;

    // Actions - Activities
    setActivities: (activities: Activity[]) => void;
    addActivity: (activity: Activity) => void;

    // Search & Filter
    setSearchQuery: (query: string) => void;
    setLeadStatusFilter: (status: LeadStatus | 'all') => void;
    setDealStageFilter: (stage: DealStage | 'all') => void;

    // Utilities
    clearError: () => void;
    setLoading: (loading: boolean) => void;

    // API Actions - Sales
    fetchSales: () => Promise<void>;
    createSale: (data: Partial<Deal>) => Promise<any>;
    updateSaleApi: (saleId: string, data: Partial<Deal>) => Promise<any>;
    deleteSaleApi: (saleId: string) => Promise<boolean>;
}

export const useCrmStore = create<CrmState>((set) => ({
    // Initial State
    leads: [],
    customers: [],
    deals: [],
    activities: [],
    activeLead: null,
    activeCustomer: null,
    activeDeal: null,
    isLoading: false,
    error: null,
    searchQuery: '',
    leadStatusFilter: 'all',
    dealStageFilter: 'all',

    // Lead Actions
    setLeads: (leads) => set({ leads }),
    addLead: (lead) => set((state) => ({ leads: [...state.leads, lead] })),
    updateLead: (leadId, updates) =>
        set((state) => ({
            leads: state.leads.map((l) => (l.id === leadId ? { ...l, ...updates } : l)),
        })),
    deleteLead: (leadId) =>
        set((state) => ({
            leads: state.leads.filter((l) => l.id !== leadId),
            activeLead: state.activeLead?.id === leadId ? null : state.activeLead,
        })),
    setActiveLead: (lead) => set({ activeLead: lead }),
    convertLeadToCustomer: (leadId, customerId) =>
        set((state) => ({
            leads: state.leads.map((l) =>
                l.id === leadId ? { ...l, status: LeadStatus.CONVERTED, customerId } : l
            ),
        })),

    // Customer Actions
    setCustomers: (customers) => set({ customers }),
    addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
    updateCustomer: (customerId, updates) =>
        set((state) => ({
            customers: state.customers.map((c) => (c.id === customerId ? { ...c, ...updates } : c)),
        })),
    deleteCustomer: (customerId) =>
        set((state) => ({
            customers: state.customers.filter((c) => c.id !== customerId),
            activeCustomer: state.activeCustomer?.id === customerId ? null : state.activeCustomer,
        })),
    setActiveCustomer: (customer) => set({ activeCustomer: customer }),

    // Deal Actions
    setDeals: (deals) => set({ deals }),
    addDeal: (deal) => set((state) => ({ deals: [...state.deals, deal] })),
    updateDeal: (dealId, updates) =>
        set((state) => ({
            deals: state.deals.map((d) => (d.id === dealId ? { ...d, ...updates } : d)),
        })),
    deleteDeal: (dealId) =>
        set((state) => ({
            deals: state.deals.filter((d) => d.id !== dealId),
            activeDeal: state.activeDeal?.id === dealId ? null : state.activeDeal,
        })),
    setActiveDeal: (deal) => set({ activeDeal: deal }),
    moveDealToStage: (dealId, stage) =>
        set((state) => ({
            deals: state.deals.map((d) => (d.id === dealId ? { ...d, stage } : d)),
        })),

    // Activity Actions
    setActivities: (activities) => set({ activities }),
    addActivity: (activity) => set((state) => ({ activities: [...state.activities, activity] })),

    // Search & Filter
    setSearchQuery: (query) => set({ searchQuery: query }),
    setLeadStatusFilter: (status) => set({ leadStatusFilter: status }),
    setDealStageFilter: (stage) => set({ dealStageFilter: stage }),

    // Utilities
    clearError: () => set({ error: null }),
    setLoading: (loading) => set({ isLoading: loading }),

    // API Actions - Sales (CRM uses /api/sales endpoint)
    fetchSales: async () => {
        set({ isLoading: true, error: null });
        const res = await apiClient.get<any[]>('/api/sales');
        if (res.success) {
            set({ deals: res.data || [], isLoading: false });
        } else {
            set({ error: res.error?.message || 'Satışlar yüklenemedi', isLoading: false });
        }
    },

    createSale: async (data: Partial<Deal>) => {
        set({ isLoading: true, error: null });
        const res = await apiClient.post<any>('/api/sales', data);
        if (res.success && res.data) {
            set((state) => ({ deals: [...state.deals, res.data], isLoading: false }));
            return res.data;
        } else {
            set({ error: res.error?.message || 'Satış oluşturulamadı', isLoading: false });
            return null;
        }
    },

    updateSaleApi: async (saleId: string, data: Partial<Deal>) => {
        set({ isLoading: true, error: null });
        const res = await apiClient.put<any>(`/api/sales/${saleId}`, data);
        if (res.success && res.data) {
            set((state) => ({
                deals: state.deals.map((d) => (d.id === saleId ? { ...d, ...res.data } : d)),
                isLoading: false,
            }));
            return res.data;
        } else {
            set({ error: res.error?.message || 'Satış güncellenemedi', isLoading: false });
            return null;
        }
    },

    deleteSaleApi: async (saleId: string) => {
        set({ isLoading: true, error: null });
        const res = await apiClient.delete<any>(`/api/sales/${saleId}`);
        if (res.success) {
            set((state) => ({
                deals: state.deals.filter((d) => d.id !== saleId),
                activeDeal: state.activeDeal?.id === saleId ? null : state.activeDeal,
                isLoading: false,
            }));
            return true;
        } else {
            set({ error: res.error?.message || 'Satış silinemedi', isLoading: false });
            return false;
        }
    },
}));
