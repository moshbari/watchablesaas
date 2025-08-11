-- Promote the specified user to admin by email (idempotent)
INSERT INTO public.profiles (id, email, role)
SELECT u.id, u.email, 'admin'
FROM auth.users u
WHERE lower(u.email) = lower('engr.mbari@gmail.com')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;