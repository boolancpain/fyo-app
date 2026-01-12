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
    updateAppPosition: (appId: string, position: { row: number; col: number }) => void;
    addApp: (app: Omit<App, 'gridPosition'>) => void;
    deleteApp: (appId: string) => void;
    updateApp: (appId: string, updates: Partial<Omit<App, 'id' | 'gridPosition'>>) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
    apps: [
        { id: 'google', name: 'Google', launchUrl: 'https://www.google.com/search?igu=1', icon: 'search', gridPosition: { row: 1, col: 1 } },
        { id: 'vscode', name: 'VS Code', launchUrl: 'https://vscode.dev', icon: 'monitor', gridPosition: { row: 2, col: 1 } },
        { id: 'github', name: 'GitHub', launchUrl: 'https://github.com', icon: 'github', gridPosition: { row: 3, col: 1 } },
    ],
    updateAppPosition: (appId, position) => {
        set((state) => {
            const targetApp = state.apps.find(
                (a) => a.gridPosition.row === position.row && a.gridPosition.col === position.col
            );

            if (targetApp && targetApp.id !== appId) {
                // Swap positions if another app is already there
                const draggedApp = state.apps.find((a) => a.id === appId);
                if (!draggedApp) return state;

                return {
                    apps: state.apps.map((app) => {
                        if (app.id === appId) return { ...app, gridPosition: position };
                        if (app.id === targetApp.id) return { ...app, gridPosition: draggedApp.gridPosition };
                        return app;
                    }),
                };
            }

            return {
                apps: state.apps.map((app) =>
                    app.id === appId ? { ...app, gridPosition: position } : app
                ),
            };
        });
    },
    addApp: (app) => {
        const { apps } = get();
        // Find next available grid position (simple logic: end of first column)
        const maxRow = Math.max(...apps.map(a => a.gridPosition.row), 0);
        const newApp: App = {
            ...app,
            gridPosition: { row: maxRow + 1, col: 1 }
        };
        set({ apps: [...apps, newApp] });
    },
    deleteApp: (appId) => {
        set((state) => ({
            apps: state.apps.filter(app => app.id !== appId)
        }));
    },
    updateApp: (appId, updates) => {
        set((state) => ({
            apps: state.apps.map(app =>
                app.id === appId ? { ...app, ...updates } : app
            )
        }));
    },
}));
