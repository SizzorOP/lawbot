# YuktiAI Deployment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deploy the YuktiAI Next.js frontend to Netlify and the FastAPI backend to a persistent cloud host (Render.com) so users can test it globally without localhost.

**Architecture:** 
- **Frontend**: Next.js app (`ui/` directory) deployed to Netlify.
- **Backend**: FastAPI app (`main.py`) deployed to Render.com Web Service.

**Tech Stack:** Netlify (Frontend), Render (Backend), Next.js, FastAPI

---

### Task 1: Environment Variable Support for Frontend
**Files:**
- Modify: `c:\Automation\lawbot\ui\src\lib\api.ts`
- Modify: `c:\Automation\lawbot\ui\src\app\research\page.tsx`

**Step 1: Write minimal implementation**
Replace hardcoded `http://localhost:8000` with `process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`.

**Step 2: Commit**
`git commit -m "feat: add NEXT_PUBLIC_API_URL env variable for dynamic backend routing"`

### Task 2: CORS Support for Backend
**Files:**
- Modify: `c:\Automation\lawbot\main.py`

**Step 1: Write minimal implementation**
Modify `allow_origins=["http://localhost:3000"]` to use an environment variable `FRONTEND_URL` so it can accept requests from the deployed Netlify URL.

**Step 2: Commit**
`git commit -m "feat: add FRONTEND_URL env variable for secure CORS in production"`

### Task 3: Deploy Frontend to Netlify
- Use the `netlify` MCP to deploy `ui/` directory to a new site.

### Task 4: Guide User to Deploy Backend to Render
- Provide specific instructions for connecting the GitHub repository to Render and setting the Start Command to `uvicorn main:app --host 0.0.0.0 --port $PORT`.

