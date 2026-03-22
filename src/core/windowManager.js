import { renderWelcomeCenter } from '../apps/welcomeCenter.js';
import { appRegistry, desktopIcons } from '../utils/constants.js';
import { constrainWindow, getInitialWindowRect, maximizeRect, resizeWindow } from '../utils/windowMath.js';

const appRenderers = {
  'welcome-center': renderWelcomeCenter
};

export class WindowManager {
  constructor({ onStateChange }) {
    this.onStateChange = onStateChange;
    this.desktopIcons = desktopIcons;
    this.windows = [];
    this.selectedIconId = null;
    this.startMenuOpen = false;
    this.contextMenu = null;
    this.zIndex = 10;
    this.pointerAction = null;
  }

  init() {
    this.bindGlobalEvents();
    this.openApp('welcome-center');
  }

  destroy() {
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('blur', this.handlePointerUp);
    window.removeEventListener('resize', this.handleResize);
  }

  bindGlobalEvents() {
    this.handlePointerMove = (event) => {
      if (!this.pointerAction) return;
      const action = this.pointerAction;
      const deltaX = event.clientX - action.startX;
      const deltaY = event.clientY - action.startY;

      if (action.type === 'drag') {
        const rect = constrainWindow({
          ...action.startRect,
          x: action.startRect.x + deltaX,
          y: action.startRect.y + deltaY
        }, action.minSize);
        this.patchWindow(action.windowId, { rect, restoreRect: rect });
      }

      if (action.type === 'resize') {
        const rect = resizeWindow(action.startRect, action.direction, deltaX, deltaY, action.minSize);
        this.patchWindow(action.windowId, { rect, restoreRect: rect, isMaximized: false });
      }
    };

    this.handlePointerUp = () => {
      this.pointerAction = null;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    this.handleResize = () => {
      this.windows = this.windows.map((win) => ({
        ...win,
        rect: win.isMaximized ? maximizeRect() : constrainWindow(win.rect, win.minSize),
        restoreRect: constrainWindow(win.restoreRect, win.minSize)
      }));
      this.emit();
    };

    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('blur', this.handlePointerUp);
    window.addEventListener('resize', this.handleResize);
  }

  emit() {
    this.onStateChange(this.getState());
  }

  getState() {
    return {
      desktopIcons: this.desktopIcons,
      windows: [...this.windows].sort((a, b) => a.zIndex - b.zIndex),
      selectedIconId: this.selectedIconId,
      startMenuOpen: this.startMenuOpen,
      contextMenu: this.contextMenu,
      runningApps: this.windows.map(({ id, appId, title, icon, isFocused, isMinimized }) => ({
        id,
        appId,
        title,
        icon,
        isFocused,
        isMinimized
      }))
    };
  }

  selectIcon(iconId) {
    this.selectedIconId = iconId;
    this.contextMenu = null;
    this.emit();
  }

  clearDesktopState() {
    this.selectedIconId = null;
    this.contextMenu = null;
    this.startMenuOpen = false;
    this.emit();
  }

  setContextMenu(position) {
    this.contextMenu = position;
    this.startMenuOpen = false;
    this.selectedIconId = null;
    this.emit();
  }

  toggleStartMenu() {
    this.startMenuOpen = !this.startMenuOpen;
    this.contextMenu = null;
    this.emit();
  }

  openApp(appId) {
    const app = appRegistry[appId];
    if (!app) return;

    const existing = this.windows.find((win) => win.appId === appId);
    this.startMenuOpen = false;
    this.contextMenu = null;

    if (existing) {
      this.focusWindow(existing.id);
      this.patchWindow(existing.id, { isMinimized: false });
      return;
    }

    const rect = getInitialWindowRect(app.defaultSize, this.windows.length);
    const id = `${appId}-${Date.now()}`;
    const zIndex = ++this.zIndex;
    this.windows = this.windows.map((win) => ({ ...win, isFocused: false }));
    this.windows.push({
      id,
      appId,
      title: app.title,
      icon: app.icon,
      rect,
      restoreRect: rect,
      minSize: app.minSize,
      isFocused: true,
      isMinimized: false,
      isMaximized: false,
      zIndex,
      content: appRenderers[appId]()
    });
    this.emit();
  }

  focusWindow(windowId) {
    const zIndex = ++this.zIndex;
    this.windows = this.windows.map((win) => ({
      ...win,
      isFocused: win.id === windowId,
      zIndex: win.id === windowId ? zIndex : win.zIndex
    }));
    this.emit();
  }

  patchWindow(windowId, patch) {
    let changed = false;
    this.windows = this.windows.map((win) => {
      if (win.id !== windowId) return win;
      changed = true;
      return { ...win, ...patch };
    });
    if (changed) this.emit();
  }

  closeWindow(windowId) {
    this.windows = this.windows.filter((win) => win.id !== windowId);
    if (this.windows.length > 0) {
      const topWindow = this.windows.reduce((best, current) => current.zIndex > best.zIndex ? current : best);
      this.windows = this.windows.map((win) => ({ ...win, isFocused: win.id === topWindow.id }));
    }
    this.emit();
  }

  minimizeWindow(windowId) {
    this.windows = this.windows.map((win) => win.id === windowId ? { ...win, isMinimized: true, isFocused: false } : win);
    this.emit();
  }

  toggleTaskbarWindow(windowId) {
    const target = this.windows.find((win) => win.id === windowId);
    if (!target) return;
    const shouldMinimize = target.isFocused && !target.isMinimized;
    const zIndex = ++this.zIndex;
    this.windows = this.windows.map((win) => {
      if (win.id !== windowId) return { ...win, isFocused: false };
      return {
        ...win,
        isMinimized: shouldMinimize,
        isFocused: !shouldMinimize,
        zIndex: shouldMinimize ? win.zIndex : zIndex
      };
    });
    this.emit();
  }

  toggleMaximize(windowId) {
    this.windows = this.windows.map((win) => {
      if (win.id !== windowId) return win;
      if (win.isMaximized) {
        return { ...win, isMaximized: false, rect: constrainWindow(win.restoreRect, win.minSize) };
      }
      return { ...win, isMaximized: true, restoreRect: win.rect, rect: maximizeRect() };
    });
    this.focusWindow(windowId);
  }

  startDrag(event, windowId) {
    const target = this.windows.find((win) => win.id === windowId);
    if (!target || target.isMaximized) return;
    this.pointerAction = {
      type: 'drag',
      windowId,
      startX: event.clientX,
      startY: event.clientY,
      startRect: target.rect,
      minSize: target.minSize
    };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    this.focusWindow(windowId);
  }

  startResize(event, windowId, direction) {
    const target = this.windows.find((win) => win.id === windowId);
    if (!target) return;
    this.pointerAction = {
      type: 'resize',
      windowId,
      direction,
      startX: event.clientX,
      startY: event.clientY,
      startRect: target.rect,
      minSize: target.minSize
    };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = `${direction}-resize`;
    this.focusWindow(windowId);
  }
}
