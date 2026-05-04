UPDATE public.multivideo_pages
SET videos = videos || '[
  {"id":"a1111111-1111-1111-1111-111111111101","title":"","video_type":"youtube","video_url":"https://www.youtube.com/watch?v=4VSyR3n2i-E","start_time":3743,"end_time":3882,"skip_sections":[]},
  {"id":"a1111111-1111-1111-1111-111111111102","title":"","video_type":"youtube","video_url":"https://www.youtube.com/watch?v=TJ_CuMwHBAU","start_time":3175,"end_time":3209,"skip_sections":[]},
  {"id":"a1111111-1111-1111-1111-111111111103","title":"","video_type":"youtube","video_url":"https://www.youtube.com/watch?v=P8FkzlxS9LA","start_time":7193,"end_time":7230,"skip_sections":[]},
  {"id":"a1111111-1111-1111-1111-111111111104","title":"","video_type":"youtube","video_url":"https://www.youtube.com/watch?v=PdqqIP4r590","start_time":5121,"end_time":5131,"skip_sections":[]},
  {"id":"a1111111-1111-1111-1111-111111111105","title":"","video_type":"youtube","video_url":"https://www.youtube.com/watch?v=q-lZg3ms8A0","start_time":1415,"end_time":1442,"skip_sections":[]},
  {"id":"a1111111-1111-1111-1111-111111111106","title":"","video_type":"youtube","video_url":"https://www.youtube.com/watch?v=6hhLVGbtWhw","start_time":2711,"end_time":2738,"skip_sections":[]},
  {"id":"a1111111-1111-1111-1111-111111111107","title":"","video_type":"youtube","video_url":"https://www.youtube.com/watch?v=DhAO8skFLBc","start_time":2532,"end_time":2558,"skip_sections":[]}
]'::jsonb,
updated_at = now()
WHERE slug = 'onboarding-call-rating';