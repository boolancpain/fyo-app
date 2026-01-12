import { create } from 'zustand';

export interface App {
    id: string;
    name: string;
    icon: string; // 'search' | 'monitor' | 'github'
    launchUrl: string;
    gridPosition: { row: number; col: number };
}

interface AppStore {
    apps: App[];
    fetchApps: () => Promise<void>;
    updateAppPosition: (appId: string, position: { row: number; col: number }) => Promise<void>;
    addApp: (app: Omit<App, 'gridPosition'>) => Promise<void>;
    deleteApp: (appId: string) => Promise<void>;
    updateApp: (appId: string, updates: Partial<Omit<App, 'id' | 'gridPosition'>>) => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
    apps: [],
    fetchApps: async () => {
        try {
            const response = await fetch('/api/apps');
            const data = await response.json();
            if (Array.isArray(data)) {
                set({
                    apps: data.map(app => ({
                        id: app.id,
                        name: app.name,
                        icon: app.icon,
                        launchUrl: app.launchUrl,
                        gridPosition: { row: app.gridRow, col: app.gridCol }
                    }))
                });
            }
        } catch (error) {
            console.error('Failed to fetch apps:', error);
        }
    },
    updateAppPosition: async (appId, position) => {
        const { apps } = get();
        const targetApp = apps.find(
            (a) => a.gridPosition.row === position.row && a.gridPosition.col === position.col
        );

        const draggedApp = apps.find((a) => a.id === appId);
        if (!draggedApp) return;

        // Optimistic update
        const originalApps = [...apps];
        let newApps = [...apps];

        if (targetApp && targetApp.id !== appId) {
            // Swap positions
            newApps = apps.map((app) => {
                if (app.id === appId) return { ...app, gridPosition: position };
                if (app.id === targetApp.id) return { ...app, gridPosition: draggedApp.gridPosition };
                return app;
            });
        } else {
            newApps = apps.map((app) =>
                app.id === appId ? { ...app, gridPosition: position } : app
            );
        }

        set({ apps: newApps });

        try {
            // Update on server
            await fetch(`/api/apps/${appId}`, {
                method: 'PATCH',
                body: JSON.stringify({ gridRow: position.row, gridCol: position.col }),
            });

            if (targetApp && targetApp.id !== appId) {
                await fetch(`/api/apps/${targetApp.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ gridRow: draggedApp.gridPosition.row, gridCol: draggedApp.gridPosition.col }),
                });
            }
        } catch (error) {
            console.error('Failed to update position:', error);
            set({ apps: originalApps }); // Rollback
        }
    },
    addApp: async (app) => {
        const { apps } = get();
        const maxRow = Math.max(...apps.map(a => a.gridPosition.row), 0);
        const gridPosition = { row: maxRow + 1, col: 1 };

        try {
            const response = await fetch('/api/apps', {
                method: 'POST',
                body: JSON.stringify({
                    name: app.name,
                    launchUrl: app.launchUrl,
                    icon: app.icon,
                    gridRow: gridPosition.row,
                    gridCol: gridPosition.col,
                }),
            });
            const newAppData = await response.json();
            const newApp: App = {
                id: newAppData.id,
                name: newAppData.name,
                launchUrl: newAppData.launchUrl,
                icon: newAppData.icon,
                gridPosition: { row: newAppData.gridRow, col: newAppData.gridCol }
            };
            set({ apps: [...apps, newApp] });
        } catch (error) {
            console.error('Failed to add app:', error);
        }
    },
    deleteApp: async (appId) => {
        const { apps } = get();
        const originalApps = [...apps];
        set({ apps: apps.filter(app => app.id !== appId) });

        try {
            await fetch(`/api/apps/${appId}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to delete app:', error);
            set({ apps: originalApps });
        }
    },
    updateApp: async (appId, updates) => {
        const { apps } = get();
        const originalApps = [...apps];
        set({
            apps: apps.map(app =>
                app.id === appId ? { ...app, ...updates } : app
            )
        });

        try {
            await fetch(`/api/apps/${appId}`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
            });
        } catch (error) {
            console.error('Failed to update app:', error);
            set({ apps: originalApps });
        }
    },
}));
