import { create } from 'zustand';
import { Window, WindowState } from '@/types/window';

interface WindowStore {
    windows: Window[];
    focusedWindowId: string | null;
    maxZIndex: number;

    openWindow: (app: { id: string; name: string; launchUrl: string }) => void;
    closeWindow: (windowId: string) => void;
    minimizeWindow: (windowId: string) => void;
    toggleMaximize: (windowId: string) => void;
    focusWindow: (windowId: string) => void;
    updatePosition: (windowId: string, position: { x: number; y: number }) => void;
    reorderWindows: (startIndex: number, endIndex: number) => void;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
    windows: [],
    focusedWindowId: null,
    maxZIndex: 100,

    openWindow: (app) => {
        const { windows, maxZIndex } = get();
        const existing = windows.find(w => w.appId === app.id && w.state !== 'CLOSED');

        if (existing) {
            get().focusWindow(existing.windowId);
            return;
        }

        const nextZIndex = maxZIndex + 1;
        const offset = windows.length * 20;

        const newWindow: Window = {
            windowId: crypto.randomUUID(),
            appId: app.id,
            title: app.name,
            launchUrl: app.launchUrl,
            position: { x: 100 + offset, y: 100 + offset },
            size: { width: 1040, height: 690 },
            zIndex: nextZIndex,
            state: 'NORMAL',
            isFocused: true,
        };

        set({
            windows: [...windows.map(w => ({ ...w, isFocused: false })), newWindow],
            focusedWindowId: newWindow.windowId,
            maxZIndex: nextZIndex,
        });
    },

    closeWindow: (windowId) => {
        set(state => ({
            windows: state.windows.filter(w => w.windowId !== windowId),
            focusedWindowId: state.focusedWindowId === windowId ? null : state.focusedWindowId,
        }));
    },

    minimizeWindow: (windowId: string) => {
        set(state => ({
            windows: state.windows.map(w =>
                w.windowId === windowId ? { ...w, state: 'MINIMIZED', isFocused: false } : w
            ),
            focusedWindowId: state.focusedWindowId === windowId ? null : state.focusedWindowId,
        }));
    },

    toggleMaximize: (windowId) => {
        set(state => ({
            windows: state.windows.map(w => {
                if (w.windowId !== windowId) return w;
                if (w.state === 'MAXIMIZED') {
                    return {
                        ...w,
                        state: 'NORMAL',
                        position: w.lastPosition || w.position,
                        size: w.lastSize || w.size,
                    };
                } else {
                    return {
                        ...w,
                        state: 'MAXIMIZED',
                        lastPosition: { ...w.position },
                        lastSize: { ...w.size },
                        position: { x: 0, y: 0 },
                        size: { width: window.innerWidth, height: window.innerHeight - 48 }, // Account for taskbar
                    };
                }
            }),
        }));
    },

    focusWindow: (windowId) => {
        const { maxZIndex } = get();
        const nextZIndex = maxZIndex + 1;

        set(state => ({
            windows: state.windows.map(w =>
                w.windowId === windowId
                    ? { ...w, state: w.state === 'MINIMIZED' ? 'NORMAL' : w.state, isFocused: true, zIndex: nextZIndex }
                    : { ...w, isFocused: false }
            ),
            focusedWindowId: windowId,
            maxZIndex: nextZIndex,
        }));
    },

    updatePosition: (windowId, position) => {
        set(state => ({
            windows: state.windows.map(w =>
                w.windowId === windowId && w.state !== 'MAXIMIZED' ? { ...w, position } : w
            ),
        }));
    },

    reorderWindows: (startIndex, endIndex) => {
        set(state => {
            const result = Array.from(state.windows);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return { windows: result };
        });
    },
}));
