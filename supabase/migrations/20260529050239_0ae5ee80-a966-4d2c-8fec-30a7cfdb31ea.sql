
CREATE TABLE public.api_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_tokens TO authenticated;
GRANT ALL ON public.api_tokens TO service_role;

ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own api token"
  ON public.api_tokens FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own api token"
  ON public.api_tokens FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own api token"
  ON public.api_tokens FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own api token"
  ON public.api_tokens FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
