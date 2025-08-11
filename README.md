# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/717590b6-7e63-418c-94cd-aeba5c4c0904

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/717590b6-7e63-418c-94cd-aeba5c4c0904) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/717590b6-7e63-418c-94cd-aeba5c4c0904) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

# Authentication & RBAC (Supabase)

This app uses Supabase Auth with role-based access control via the public.profiles table.

## Data model

- Table: public.profiles
  - id uuid PK -> auth.users.id (on delete cascade)
  - email text not null
  - role text in ('admin','user','interested') default 'interested'
  - created_at timestamptz default now()

A trigger automatically inserts a row into public.profiles on signup.

## RLS policies

- Authenticated users can read their own profile
- Admins can read and update any profile

Admin-only role changes are performed through a secure RPC: public.admin_set_role(user_id, new_role).

## Bootstrapping first admin

Run this in the Supabase SQL Editor after your account signs up and confirms email:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

## App routes

- /register — email/password signup (email confirmation)
- /login — email/password login (+ link for password reset)
- /account — view email and role, request password reset, sign out
- /admin — admin dashboard (user list, search, change roles)
- /auth/callback — email verification and password reset handler
- /embed — protected (role: user or admin)

## Local development

```bash
npm i
npm run dev
```

Lovable does not support runtime env vars in code. For non-Lovable environments, create a .env file like .env.example and wire VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your own build tooling.

## Supabase auth settings

- Set Authentication > URL Configuration > Site URL and Redirect URLs to include your app URL (and /auth/callback)
- Consider reducing OTP expiry per Supabase security guidance

## Notes on security

- RLS is enabled; client-only checks are not relied upon for admin actions
- Admin role changes execute via RPC with server-side role checks

