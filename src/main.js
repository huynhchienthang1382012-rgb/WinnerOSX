import { startClock } from './core/clock.js';
import { WindowManager } from './core/windowManager.js';
import { renderShell } from './ui/shell.js';

const root = document.getElementById('root');
const clockState = { time: '--:--', date: '--- --' };

const manager = new WindowManager({
  onStateChange: (state) => renderShell(root, state, actions, clockState)
});

const actions = {
  selectIcon: (iconId) => manager.selectIcon(iconId),
  clearDesktopState: () => manager.clearDesktopState(),
  setContextMenu: (position) => manager.setContextMenu(position),
  toggleStartMenu: () => manager.toggleStartMenu(),
  openApp: (appId) => manager.openApp(appId),
  focusWindow: (windowId) => manager.focusWindow(windowId),
  minimizeWindow: (windowId) => manager.minimizeWindow(windowId),
  toggleTaskbarWindow: (windowId) => manager.toggleTaskbarWindow(windowId),
  toggleMaximize: (windowId) => manager.toggleMaximize(windowId),
  closeWindow: (windowId) => manager.closeWindow(windowId),
  startDrag: (event, windowId) => manager.startDrag(event, windowId),
  startResize: (event, windowId, direction) => manager.startResize(event, windowId, direction)
};

startClock((nextClock) => {
  clockState.time = nextClock.time;
  clockState.date = nextClock.date;
  renderShell(root, manager.getState(), actions, clockState);
});

manager.init();
window.addEventListener('beforeunload', () => manager.destroy());
