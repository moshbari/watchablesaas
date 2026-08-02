-- How a page moves from one video in the sequence to the next.
--   'auto'   — chain straight through (pre-buffered handoff)
--   'button' — hold on the last frame and wait for a Continue click
--
-- 'auto' is the default so existing pages and single-video pages are unaffected.

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS between_videos_mode TEXT NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS continue_button_text TEXT NOT NULL DEFAULT 'Continue Watching';

COMMENT ON COLUMN public.pages.between_videos_mode IS
  'auto = seamless chained playback; button = wait for a Continue click between videos.';
