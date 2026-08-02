-- Sequential multi-video playback for the single-video Page Builder.
--
-- `videos` holds an ordered array of segments that play back-to-back in one player.
-- Shape matches multivideo_pages.videos so the two builders share the same type:
--   [{ id, title, video_url, video_type, start_time, end_time, skip_sections: [{from,to}] }]
--
-- Legacy pages keep their flat video_url/start_time/end_time/skip_sections columns.
-- An empty `videos` array means "fall back to the legacy single-video columns",
-- so every existing page keeps rendering exactly as it does today.

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS videos JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.pages.videos IS
  'Ordered video segments played in sequence. Empty = use legacy video_url/start_time/end_time/skip_sections.';
