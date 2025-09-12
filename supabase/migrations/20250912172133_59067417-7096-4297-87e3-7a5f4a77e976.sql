-- Step 1: Add trial fields to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN trial_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Make email optional
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- Step 3: Create new role enum
CREATE TYPE public.user_role AS ENUM ('TRIAL', 'UNLIMITED', 'SUSPENDED', 'admin');

-- Step 4: Add a new column with the enum type
ALTER TABLE public.profiles ADD COLUMN new_role public.user_role DEFAULT 'TRIAL';

-- Step 5: Populate the new column based on old role values
UPDATE public.profiles SET new_role = 
  CASE 
    WHEN role = 'admin' THEN 'admin'::public.user_role
    ELSE 'TRIAL'::public.user_role
  END;

-- Step 6: Drop the old column and rename the new one
ALTER TABLE public.profiles DROP COLUMN role;
ALTER TABLE public.profiles RENAME COLUMN new_role TO role;

-- Step 7: Set default for the role column
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'TRIAL'::public.user_role;