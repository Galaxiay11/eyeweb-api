# EyeWeb API (Vercel + Supabase)

This folder is a standalone Vercel Serverless API.
Import just this folder as a project on Vercel (Root Directory = `vercel-api`).

Env vars required on Vercel:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- JWT_SECRET

Endpoints: /api/health, /api/auth/login, /api/auth/logout, /api/logs, /api/block-ip, /api/blocked-ips
