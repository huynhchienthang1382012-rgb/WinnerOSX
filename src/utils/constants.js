export const TASKBAR_HEIGHT = 64;
export const MIN_WINDOW_WIDTH = 320;
export const MIN_WINDOW_HEIGHT = 220;

export const desktopIcons = [
  {
    id: 'welcome-center',
    label: 'Welcome Center',
    appId: 'welcome-center',
    icon: '✦',
    x: 24,
    y: 24
  }
];

export const appRegistry = {
  'welcome-center': {
    id: 'welcome-center',
    title: 'Welcome Center',
    icon: '✦',
    defaultSize: { width: 720, height: 460 },
    minSize: { width: 420, height: 260 }
  }
};
