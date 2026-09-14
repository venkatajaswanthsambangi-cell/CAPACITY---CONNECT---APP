# CAPACITY CONNECT Enterprise Platform — Production Deployment Guide

This guide provides step-by-step instructions for deploying the **CAPACITY CONNECT Enterprise Platform** to cloud hosting providers such as **Render**, **Railway**, or any standard Node.js cloud runtime.

---

## 1. System Architecture & Prerequisites

- **Frontend**: React 18 + Vite 6 + Tailwind CSS (SPA, compiled to `dist/`).
- **Backend**: Node.js + Express (compiled to ESM bundle at `server/index.js`).
- **Unified Server**: The Express server serves both the REST API (`/api/*`) and the static frontend SPA (`dist/`).
- **Node.js Runtime**: Recommended Node.js `v18.x`, `v20.x`, or `v22.x`.
- **Database**: Local persistent JSON document store at `data/capacity_connect_db.json`.

---

## 2. Production Commands

| Step | Command | Description |
| :--- | :--- | :--- |
| **Install Dependencies** | `npm install` | Installs dependencies specified in `package.json`. |
| **Build Command** | `npm run build` | Compiles TypeScript, bundles the Vite frontend into `dist/`, and bundles the Express server into `server/index.js`. |
| **Start Command** | `node server/index.js` | Launches the production HTTP server on `$PORT` with static asset serving and API routing. |
| **Alternative Start** | `npm start` | Executes `node server/index.js`. |

---

## 3. Environment Variables

Configure these variables in your hosting provider's dashboard (e.g. Render **Environment** tab):

| Variable Name | Required | Example / Recommended Value | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **Yes** | `production` | Enables production mode, disables dev middlewares, and serves pre-built assets from `dist/`. |
| `PORT` | **Yes** | `10000` *(Auto-assigned)* | The port the HTTP server binds to (`0.0.0.0`). Cloud platforms like Render supply this dynamically. |
| `SUPER_ADMIN_EMAIL` | **Yes** | `venkatajaswanthsambangi@gmail.com` | Root system administrator email with full platform governance privileges. |
| `GEMINI_API_KEY` | Optional | `AIzaSy...` | Google Gemini API Key for the AI Learning Assistant. (Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey)). When omitted, the assistant safely defaults to sandbox curriculum mode. |

---

## 4. Step-by-Step Deployment on Render (Web Service)

### Method A: Git-Connected Web Service (Recommended)

1. **Push Code to Git**:
   Push the latest project files to your GitHub or GitLab repository.
   ```bash
   git add .
   git commit -m "chore: prepare for production deployment"
   git push origin main
   ```

2. **Create a New Web Service**:
   - Go to [https://dashboard.render.com/](https://dashboard.render.com/).
   - Click **New +** in the top navigation and select **Web Service**.
   - Connect your GitHub / GitLab account and select your `capacity-connect` repository.

3. **Configure Service Settings**:
   - **Name**: `capacity-connect` (or your preferred application slug)
   - **Region**: Choose the region closest to your users (e.g., `Oregon (US West)`, `Frankfurt (EU)`)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (root of repository)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server/index.js`
   - **Instance Type**: `Free` (or higher)

4. **Set Environment Variables**:
   Under the **Environment Variables** section, add:
   - `NODE_ENV` = `production`
   - `SUPER_ADMIN_EMAIL` = `venkatajaswanthsambangi@gmail.com`
   - `GEMINI_API_KEY` = *[Your Gemini API Key]*

5. **(Optional) Attach a Persistent Disk for Long-Term Data**:
   *Render's free tier uses an ephemeral disk which resets data upon container sleep or rebuild. To keep changes permanently across rebuilds:*
   - Go to the **Disks** section in Render.
   - Click **Add Disk**.
   - **Name**: `capacity-data`
   - **Mount Path**: `/data` (or map to `data` in project root)
   - **Size**: `1 GB`

6. **Deploy**:
   - Click **Create Web Service**.
   - Render will clone the repository, run `npm install && npm run build`, and execute `node server/index.js`.
   - The deployment logs will indicate:
     ```
     [Capacity Connect] Serving production build from dist/
     CAPACITY CONNECT Enterprise Server Active
     Running at: http://0.0.0.0:10000
     Health Check: http://0.0.0.0:10000/api/health
     ```

---

### Method B: Blueprint Infrastructure as Code (`render.yaml`)

This repository includes a pre-configured `render.yaml` file:

```yaml
services:
  - type: web
    name: capacity-connect
    env: node
    plan: free
    region: oregon
    buildCommand: npm install && npm run build
    startCommand: node server/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: GEMINI_API_KEY
        sync: false
      - key: SUPER_ADMIN_EMAIL
        value: venkatajaswanthsambangi@gmail.com
```

To deploy via Blueprint:
1. Go to [Render Blueprints](https://dashboard.render.com/blueprints).
2. Click **New Blueprint Instance**.
3. Connect your repository. Render automatically reads `render.yaml` and applies all build, start, and environment configurations.

---

## 5. Verifying Deployment & Obtaining the Live URL

1. **Locate the Live URL**:
   At the top left of your Render service dashboard, click your generated domain:
   `https://capacity-connect-xxxx.onrender.com`

2. **Verify the Health Check**:
   Open:
   ```
   https://capacity-connect-xxxx.onrender.com/api/health
   ```
   Expected response (HTTP 200):
   ```json
   {
     "status": "healthy",
     "app": "CAPACITY CONNECT Enterprise",
     "version": "1.0.0",
     "environment": "production"
   }
   ```

3. **Verify the Single Page Application**:
   Navigate to `https://capacity-connect-xxxx.onrender.com/`. The login / enterprise dashboard loads immediately with dark theme styling, navigation bar, and demo account shortcuts.

4. **Verify Role Authentication**:
   - Click **Super Admin Access** (`venkatajaswanthsambangi@gmail.com`).
   - Navigate to **System Settings** and **Audit Logs** to confirm elevated privileges.
   - Switch to **Learner** (`learner@capacityconnect.org`) to confirm access controls and restricted route guards (`403 Forbidden`).

---

## 6. How to Redeploy After Code Changes

1. **Automatic Continuous Deployment**:
   Every time you push a commit to `main`, Render automatically triggers a new build and zero-downtime deployment.

2. **Manual Redeploy**:
   - In the Render Dashboard, click the **Manual Deploy** dropdown in the top right.
   - Select **Deploy latest commit** or **Clear build cache & deploy**.

---

## 7. Troubleshooting Common Deployment Issues

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| `Cannot find module 'server/index.js'` | `npm run build` was omitted or failed. | Ensure the Build Command is `npm install && npm run build`. |
| Port binding timeout / `502 Bad Gateway` | Server listening on fixed port or `localhost` instead of `0.0.0.0`. | The server is pre-configured to bind to `0.0.0.0` with `process.env.PORT`. Verify `PORT` is not hardcoded. |
| AI Tutor responses are generic | `GEMINI_API_KEY` is missing or invalid. | Verify `GEMINI_API_KEY` is set in the host environment variables. |
| User changes reset after server restart | Ephemeral container filesystem restart. | Attach a Render Persistent Disk mounted at `/data` or migrate `server/db.ts` to MongoDB Atlas or PostgreSQL. |
