import { create } from 'zustand';

interface ConfigStore {
    configs: Record<string, string>;
    fetchConfigs: () => Promise<void>;
    updateConfig: (id: string, value: string) => Promise<void>;
}

export const useConfigStore = create<ConfigStore>((set) => ({
    configs: {},
    fetchConfigs: async () => {
        try {
            const response = await fetch('/api/configs');
            const data = await response.json();
            set({ configs: data });
        } catch (error) {
            console.error('Failed to fetch configs:', error);
        }
    },
    updateConfig: async (id, value) => {
        set((state) => ({
            configs: { ...state.configs, [id]: value }
        }));

        try {
            await fetch('/api/configs', {
                method: 'PATCH',
                body: JSON.stringify({ id, value }),
            });
        } catch (error) {
            console.error('Failed to update config:', error);
        }
    },
}));
