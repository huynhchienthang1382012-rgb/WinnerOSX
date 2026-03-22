const resizeHandles = ['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

export function renderShell(root, state, actions, clock) {
  root.innerHTML = `
    <main class="winner-os-shell">
      <div class="desktop-surface" aria-label="WinnerOS desktop">
        <div class="wallpaper-overlay"></div>
        ${state.desktopIcons.map((icon) => `
          <button
            type="button"
            class="desktop-icon ${state.selectedIconId === icon.id ? 'selected' : ''}"
            data-action="select-icon"
            data-icon-id="${icon.id}"
            style="left: ${icon.x}px; top: ${icon.y}px;"
          >
            <span class="desktop-icon-glyph">${icon.icon}</span>
            <span class="desktop-icon-label">${icon.label}</span>
          </button>
        `).join('')}

        ${state.windows.map((win) => `
          <section
            class="window-frame ${win.isFocused ? 'focused' : ''} ${win.isMaximized ? 'maximized' : ''}"
            data-window-id="${win.id}"
            style="width:${win.rect.width}px;height:${win.rect.height}px;transform:translate3d(${win.rect.x}px,${win.rect.y}px,0);z-index:${win.zIndex};display:${win.isMinimized ? 'none' : 'flex'};"
          >
            <header class="window-titlebar" data-action="drag-window" data-window-id="${win.id}">
              <div class="window-title">
                <span class="window-title-icon">${win.icon}</span>
                <span>${win.title}</span>
              </div>
              <div class="window-controls">
                <button type="button" data-action="minimize-window" data-window-id="${win.id}" aria-label="Minimize">—</button>
                <button type="button" data-action="maximize-window" data-window-id="${win.id}" aria-label="Maximize">${win.isMaximized ? '❐' : '□'}</button>
                <button type="button" class="close" data-action="close-window" data-window-id="${win.id}" aria-label="Close">✕</button>
              </div>
            </header>
            <div class="window-content">${win.content}</div>
            ${win.isMaximized ? '' : resizeHandles.map((direction) => `
              <button type="button" class="resize-handle ${direction}" data-action="resize-window" data-window-id="${win.id}" data-direction="${direction}" aria-label="Resize ${direction}"></button>
            `).join('')}
          </section>
        `).join('')}

        ${state.contextMenu ? `
          <button type="button" class="context-backdrop" data-action="close-context-menu" aria-label="Close context menu"></button>
          <div class="context-menu" style="left:${state.contextMenu.x}px;top:${state.contextMenu.y}px;" role="menu">
            <button type="button" class="context-item" data-action="open-app" data-app-id="welcome-center">Open Welcome Center</button>
            <button type="button" class="context-item" data-action="close-context-menu">Refresh Desktop</button>
          </div>
        ` : ''}

        <aside class="start-menu ${state.startMenuOpen ? 'open' : ''}">
          <div class="start-menu-header">
            <span class="eyebrow">Applications</span>
            <h2>WinnerOS</h2>
          </div>
          <button type="button" class="start-app-card" data-action="open-app" data-app-id="welcome-center">
            <span class="start-app-icon">✦</span>
            <span>
              <strong>Welcome Center</strong>
              <small>System overview and interaction guide</small>
            </span>
          </button>
        </aside>
      </div>

      <footer class="taskbar">
        <button type="button" class="start-button ${state.startMenuOpen ? 'active' : ''}" data-action="toggle-start-menu">
          <span class="start-badge">◆</span>
          <span>Start</span>
        </button>

        <div class="taskbar-apps">
          ${state.runningApps.map((app) => `
            <button
              type="button"
              class="taskbar-app ${app.isFocused ? 'focused' : ''} ${app.isMinimized ? 'minimized' : ''}"
              data-action="toggle-taskbar-window"
              data-window-id="${app.id}"
              title="${app.title}"
            >
              <span>${app.icon}</span>
              <span>${app.title}</span>
            </button>
          `).join('')}
        </div>

        <div class="taskbar-clock">
          <strong>${clock.time}</strong>
          <span>${clock.date}</span>
        </div>
      </footer>
    </main>
  `;

  const desktopSurface = root.querySelector('.desktop-surface');
  desktopSurface.addEventListener('click', (event) => {
    if (event.target === desktopSurface || event.target.classList.contains('wallpaper-overlay')) {
      actions.clearDesktopState();
    }
  });

  desktopSurface.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    actions.setContextMenu({ x: event.clientX, y: event.clientY });
  });

  root.querySelectorAll('[data-window-id]').forEach((windowNode) => {
    if (windowNode.classList.contains('window-frame')) {
      windowNode.addEventListener('pointerdown', () => actions.focusWindow(windowNode.dataset.windowId));
    }
  });

  root.querySelectorAll('[data-action="select-icon"]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      actions.selectIcon(button.dataset.iconId);
    });
    button.addEventListener('dblclick', (event) => {
      event.stopPropagation();
      actions.openApp('welcome-center');
    });
  });

  root.querySelectorAll('[data-action]').forEach((element) => {
    const action = element.dataset.action;
    if (action === 'toggle-start-menu') element.addEventListener('click', () => actions.toggleStartMenu());
    if (action === 'open-app') element.addEventListener('click', () => actions.openApp(element.dataset.appId));
    if (action === 'close-context-menu') element.addEventListener('click', () => actions.clearDesktopState());
    if (action === 'toggle-taskbar-window') element.addEventListener('click', () => actions.toggleTaskbarWindow(element.dataset.windowId));
    if (action === 'minimize-window') element.addEventListener('click', (event) => { event.stopPropagation(); actions.minimizeWindow(element.dataset.windowId); });
    if (action === 'maximize-window') element.addEventListener('click', (event) => { event.stopPropagation(); actions.toggleMaximize(element.dataset.windowId); });
    if (action === 'close-window') element.addEventListener('click', (event) => { event.stopPropagation(); actions.closeWindow(element.dataset.windowId); });
    if (action === 'drag-window') element.addEventListener('pointerdown', (event) => {
      if (event.target.closest('.window-controls')) return;
      actions.startDrag(event, element.dataset.windowId);
    });
    if (action === 'resize-window') element.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      actions.startResize(event, element.dataset.windowId, element.dataset.direction);
    });
  });
}
