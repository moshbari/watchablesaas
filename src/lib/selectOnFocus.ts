/**
 * Number boxes (every time field: trim, skips, button delays, …) select their
 * whole value when tapped or clicked, so typing replaces the "0" instead of
 * landing beside it. One document-level listener covers every such box,
 * including ones added later.
 */
const isNumberBox = (el: EventTarget | null): el is HTMLInputElement =>
  el instanceof HTMLInputElement && (el.type === 'number' || el.inputMode === 'numeric');

export const installSelectOnFocus = () => {
  let justFocused: HTMLInputElement | null = null;

  document.addEventListener('focusin', (event) => {
    if (!isNumberBox(event.target)) return;
    const input = event.target;
    justFocused = input;
    // Selecting during focus loses to the browser placing the caret; wait a tick.
    setTimeout(() => {
      try { input.select(); } catch { /* not selectable */ }
    }, 0);
  });

  // The click that focused the box would otherwise drop the selection on release.
  document.addEventListener('mouseup', (event) => {
    if (justFocused && event.target === justFocused) event.preventDefault();
    justFocused = null;
  });
};
