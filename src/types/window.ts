export type WindowState = 'NORMAL' | 'MINIMIZED' | 'MAXIMIZED' | 'CLOSED';

export interface Window {
    windowId: string;
    appId: string;
    title: string;
    launchUrl: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    lastPosition?: { x: number; y: number };
    lastSize?: { width: number; height: number };
    zIndex: number;
    state: WindowState;
    isFocused: boolean;
}

export interface App {
    id: string;
    name: string;
    icon: string; // URL or name for icon
    launchUrl: string;
}
