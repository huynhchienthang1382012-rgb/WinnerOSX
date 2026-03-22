export function startClock(onTick) {
  const emit = () => {
    const now = new Date();
    const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(now);
    const date = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(now);
    onTick({ time, date });
  };

  emit();
  const timer = window.setInterval(emit, 1000);
  return () => window.clearInterval(timer);
}
