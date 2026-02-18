import { create } from 'zustand';
import { Project, ProjectStatus, ProjectType, Task, Milestone, BudgetItem } from '@/types/erp';
import apiClient from '@/lib/api-client';

interface ErpState {
    // State
    projects: Project[];
    activeProject: Project | null;
    tasks: Task[];
    milestones: Milestone[];
    budgetItems: BudgetItem[];
    isLoading: boolean;
    error: string | null;

    // Filter & Search
    searchQuery: string;
    statusFilter: ProjectStatus | 'all';
    typeFilter: ProjectType | 'all';

    // Actions
    setProjects: (projects: Project[]) => void;
    addProject: (project: Project) => void;
    updateProject: (projectId: string, updates: Partial<Project>) => void;
    deleteProject: (projectId: string) => void;
    setActiveProject: (project: Project | null) => void;

    // Tasks
    setTasks: (tasks: Task[]) => void;
    addTask: (task: Task) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    deleteTask: (taskId: string) => void;

    // Milestones
    setMilestones: (milestones: Milestone[]) => void;
    addMilestone: (milestone: Milestone) => void;
    updateMilestone: (milestoneId: string, updates: Partial<Milestone>) => void;
    deleteMilestone: (milestoneId: string) => void;

    // Budget
    setBudgetItems: (items: BudgetItem[]) => void;
    addBudgetItem: (item: BudgetItem) => void;

    // Search & Filter
    setSearchQuery: (query: string) => void;
    setStatusFilter: (status: ProjectStatus | 'all') => void;
    setTypeFilter: (type: ProjectType | 'all') => void;

    // Utilities
    clearError: () => void;
    setLoading: (loading: boolean) => void;

    // API Actions - Projects
    fetchProjects: () => Promise<void>;
    createProject: (data: Partial<Project>) => Promise<any>;
    updateProjectApi: (projectId: string, data: Partial<Project>) => Promise<any>;
    deleteProjectApi: (projectId: string) => Promise<boolean>;
}

export const useErpStore = create<ErpState>((set) => ({
    // Initial State
    projects: [],
    activeProject: null,
    tasks: [],
    milestones: [],
    budgetItems: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    statusFilter: 'all',
    typeFilter: 'all',

    // Project Actions
    setProjects: (projects) => set({ projects }),
    addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
    updateProject: (projectId, updates) =>
        set((state) => ({
            projects: state.projects.map((p) => (p.id === projectId ? { ...p, ...updates } : p)),
        })),
    deleteProject: (projectId) =>
        set((state) => ({
            projects: state.projects.filter((p) => p.id !== projectId),
            activeProject: state.activeProject?.id === projectId ? null : state.activeProject,
        })),
    setActiveProject: (project) => set({ activeProject: project }),

    // Task Actions
    setTasks: (tasks) => set({ tasks }),
    addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
    updateTask: (taskId, updates) =>
        set((state) => ({
            tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
        })),
    deleteTask: (taskId) =>
        set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== taskId),
        })),

    // Milestone Actions
    setMilestones: (milestones) => set({ milestones }),
    addMilestone: (milestone) => set((state) => ({ milestones: [...state.milestones, milestone] })),
    updateMilestone: (milestoneId, updates) =>
        set((state) => ({
            milestones: state.milestones.map((m) => (m.id === milestoneId ? { ...m, ...updates } : m)),
        })),
    deleteMilestone: (milestoneId) =>
        set((state) => ({
            milestones: state.milestones.filter((m) => m.id !== milestoneId),
        })),

    // Budget Actions
    setBudgetItems: (items) => set({ budgetItems: items }),
    addBudgetItem: (item) => set((state) => ({ budgetItems: [...state.budgetItems, item] })),

    // Search & Filter
    setSearchQuery: (query) => set({ searchQuery: query }),
    setStatusFilter: (status) => set({ statusFilter: status }),
    setTypeFilter: (type) => set({ typeFilter: type }),

    // Utilities
    clearError: () => set({ error: null }),
    setLoading: (loading) => set({ isLoading: loading }),

    // API Actions - Projects
    fetchProjects: async () => {
        set({ isLoading: true, error: null });
        const res = await apiClient.get<any[]>('/api/projects');
        if (res.success) {
            set({ projects: res.data || [], isLoading: false });
        } else {
            set({ error: res.error?.message || 'Projeler yüklenemedi', isLoading: false });
        }
    },

    createProject: async (data: Partial<Project>) => {
        set({ isLoading: true, error: null });
        const res = await apiClient.post<any>('/api/projects', data);
        if (res.success && res.data) {
            set((state) => ({ projects: [...state.projects, res.data], isLoading: false }));
            return res.data;
        } else {
            set({ error: res.error?.message || 'Proje oluşturulamadı', isLoading: false });
            return null;
        }
    },

    updateProjectApi: async (projectId: string, data: Partial<Project>) => {
        set({ isLoading: true, error: null });
        const res = await apiClient.put<any>(`/api/projects/${projectId}`, data);
        if (res.success && res.data) {
            set((state) => ({
                projects: state.projects.map((p) => (p.id === projectId ? { ...p, ...res.data } : p)),
                isLoading: false,
            }));
            return res.data;
        } else {
            set({ error: res.error?.message || 'Proje güncellenemedi', isLoading: false });
            return null;
        }
    },

    deleteProjectApi: async (projectId: string) => {
        set({ isLoading: true, error: null });
        const res = await apiClient.delete<any>(`/api/projects/${projectId}`);
        if (res.success) {
            set((state) => ({
                projects: state.projects.filter((p) => p.id !== projectId),
                activeProject: state.activeProject?.id === projectId ? null : state.activeProject,
                isLoading: false,
            }));
            return true;
        } else {
            set({ error: res.error?.message || 'Proje silinemedi', isLoading: false });
            return false;
        }
    },
}));
