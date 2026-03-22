export function renderWelcomeCenter() {
  return `
    <div class="welcome-app">
      <section class="hero-panel">
        <div>
          <span class="eyebrow">WinnerOS Phase 1</span>
          <h1>Desktop shell initialized successfully.</h1>
          <p>
            WinnerOS is running a polished desktop environment with a reliable window manager,
            responsive taskbar, live clock, and production-ready interaction patterns.
          </p>
        </div>
        <div class="hero-badge">Stable Core</div>
      </section>

      <section class="action-grid">
        <article class="info-card">
          <h2>System Status</h2>
          <p>Core desktop services are online and responsive.</p>
        </article>
        <article class="info-card">
          <h2>Window Controls</h2>
          <p>Drag, resize, minimize, maximize, and refocus windows smoothly.</p>
        </article>
        <article class="info-card">
          <h2>Next Milestones</h2>
          <p>Explorer, Notepad, Terminal, Settings, and AI tools are queued for future phases.</p>
        </article>
      </section>

      <section class="system-footnote">
        <strong>Tip:</strong> Double-click the desktop icon to reopen this window, use the taskbar to minimize or restore it,
        and drag any edge to resize the workspace.
      </section>
    </div>
  `;
}
