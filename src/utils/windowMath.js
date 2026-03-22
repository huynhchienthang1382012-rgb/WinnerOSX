import { MIN_WINDOW_HEIGHT, MIN_WINDOW_WIDTH, TASKBAR_HEIGHT } from './constants.js';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function getViewportBounds() {
  return {
    width: window.innerWidth,
    height: window.innerHeight - TASKBAR_HEIGHT
  };
}

export function constrainWindow(rect, minSize = {}) {
  const bounds = getViewportBounds();
  const minWidth = minSize.width ?? MIN_WINDOW_WIDTH;
  const minHeight = minSize.height ?? MIN_WINDOW_HEIGHT;
  const width = clamp(rect.width, minWidth, Math.max(minWidth, bounds.width));
  const height = clamp(rect.height, minHeight, Math.max(minHeight, bounds.height));

  return {
    x: clamp(rect.x, 0, Math.max(0, bounds.width - width)),
    y: clamp(rect.y, 0, Math.max(0, bounds.height - height)),
    width,
    height
  };
}

export function getInitialWindowRect(size, offsetIndex = 0) {
  const bounds = getViewportBounds();
  const offset = offsetIndex * 28;
  return constrainWindow({
    x: 120 + offset,
    y: 72 + offset,
    width: Math.min(size.width, bounds.width - 40),
    height: Math.min(size.height, bounds.height - 40)
  }, size);
}

export function resizeWindow(rect, direction, deltaX, deltaY, minSize = {}) {
  const minWidth = minSize.width ?? MIN_WINDOW_WIDTH;
  const minHeight = minSize.height ?? MIN_WINDOW_HEIGHT;
  const bounds = getViewportBounds();
  const next = { ...rect };

  if (direction.includes('right')) {
    next.width = clamp(rect.width + deltaX, minWidth, bounds.width - rect.x);
  }
  if (direction.includes('bottom')) {
    next.height = clamp(rect.height + deltaY, minHeight, bounds.height - rect.y);
  }
  if (direction.includes('left')) {
    const shift = clamp(deltaX, -rect.x, rect.width - minWidth);
    next.x = rect.x + shift;
    next.width = rect.width - shift;
  }
  if (direction.includes('top')) {
    const shift = clamp(deltaY, -rect.y, rect.height - minHeight);
    next.y = rect.y + shift;
    next.height = rect.height - shift;
  }

  return constrainWindow(next, minSize);
}

export function maximizeRect() {
  const bounds = getViewportBounds();
  return {
    x: 0,
    y: 0,
    width: bounds.width,
    height: bounds.height
  };
}
