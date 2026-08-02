/**
 * Shared loader for the YouTube IFrame API.
 *
 * The API exposes a single global ready callback, so several components mounting
 * at once used to overwrite each other's handler. Everyone awaits this one promise
 * instead, and we poll as a safety net in case another script clobbers the global.
 */
let apiPromise: Promise<void> | null = null;

export const loadYouTubeIframeAPI = (): Promise<void> => {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<void>((resolve, reject) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);
    }

    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === 'function') {
        try { previousCallback(); } catch { /* another consumer's handler threw */ }
      }
      resolve();
    };

    const startedAt = Date.now();
    const poll = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(poll);
        resolve();
      } else if (Date.now() - startedAt > 15000) {
        clearInterval(poll);
        apiPromise = null; // let a later mount retry
        reject(new Error('YouTube player failed to load'));
      }
    }, 200);
  });

  return apiPromise;
};
