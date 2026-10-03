# 🚀 College ERP: Full-Stack GitHub Pages & MySQL Workbench Integration Guide

This guide explains how to connect your **College ERP Website** running on GitHub Pages ([https://unknown-0703.github.io/DBSE_DBD_Project/](https://unknown-0703.github.io/DBSE_DBD_Project/)) to your **MySQL Workbench** and **Express Backend**.

---

## 🧠 Architecture Overview

```
 ┌────────────────────────────────────────────────────────┐
 │   GitHub Pages (Frontend)                              │
 │   https://unknown-0703.github.io/DBSE_DBD_Project/     │
 │                                                        │
 │   • Project Showcase Landing Page (/)                  │
 │   • Live College ERP React Application (/app/)         │
 └─────────────────────────┬──────────────────────────────┘
                           │ HTTPS API Requests
                           ▼
 ┌────────────────────────────────────────────────────────┐
 │   Express.js Backend API Server                        │
 │   (Deployed on Render.com or Local Tunnel)             │
 └─────────────────────────┬──────────────────────────────┘
                           │ TCP / SQL (Port 3306 or 4000)
                           ▼
 ┌────────────────────────────────────────────────────────┐
 │   MySQL Database (Cloud or Local)                      │
 │   ▲                                                    │
 │   │ Live Admin & Inspection                            │
 │   └───────────── MySQL Workbench (Desktop GUI)         │
 └────────────────────────────────────────────────────────┘
```

> [!NOTE]
> **Why GitHub Pages alone cannot run MySQL or Node.js:**
> GitHub Pages is a static file hosting service (HTML/CSS/JS). It cannot execute Node.js (`server/index.js`) or run MySQL Server directly. However, the React frontend hosted on GitHub Pages **can make live API requests** to your backend server over HTTPS!

---

## 🌟 Method 1: 24/7 Online Deployment (Recommended)
This approach keeps your website and database online 24/7 so evaluators, faculty, and students can use the website anytime, while allowing you to manage and query everything using **MySQL Workbench**.

### Step 1: Set up Free Cloud MySQL (TiDB Cloud or Aiven)
1. Go to [https://tidbcloud.com/](https://tidbcloud.com/) (100% Free Forever, MySQL 8.0 compatible, no credit card required) or [Aiven for MySQL](https://aiven.io/).
2. Create a free **Serverless Cluster**.
3. In your cluster dashboard, click **Connect**:
   - Note down:
     - **Host**: e.g., `gateway01.us-east-1.prod.aws.tidbcloud.com`
     - **Port**: `4000`
     - **User**: e.g., `xxxxxx.root`
     - **Password**: Click *Generate Password* and copy it.
     - **Database**: `test` or `college_erp`

### Step 2: Connect MySQL Workbench to your Cloud Database
1. Open **MySQL Workbench** on your computer.
2. Under **MySQL Connections**, click the **`+`** icon to add a new connection.
3. Configure the connection:
   - **Connection Name**: `College ERP Cloud DB`
   - **Connection Method**: Standard (TCP/IP)
   - **Hostname**: `<Your TiDB / Aiven Host>`
   - **Port**: `4000` (or `3306` for Aiven)
   - **Username**: `<Your User>`
   - Click **Store in Vault...** and paste your database password.
   - Go to the **SSL** tab and choose **Require** or **If Available**.
4. Click **Test Connection**. You will see: `Connection parameters are correct!`.
5. Open this connection in MySQL Workbench. You can now execute queries, view tables, and see records live!

### Step 3: Initialize Database Schema in MySQL Workbench
1. In MySQL Workbench, open [`server/schema.sql`](./server/schema.sql).
2. Execute the script (click the ⚡ Lightning icon). All 21 tables will be created!
3. Alternatively, in your local terminal:
   ```bash
   cd server
   # update .env with your cloud DB credentials, then run:
   npm run init-db
   ```

### Step 4: Deploy Express Backend to Render.com (Free)
1. Push your updated code to GitHub:
   ```bash
   git add .
   git commit -m "Configure full-stack GitHub Pages and MySQL connection"
   git push origin main
   ```
2. Go to [https://render.com/](https://render.com/) and Sign Up/Log In with GitHub.
3. Click **New +** > **Web Service**.
4. Select your repository: `UnKnown-0703/DBSE_DBD_Project`.
5. Fill in the deployment details:
   - **Name**: `college-erp-backend`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
6. Add the following **Environment Variables** in Render:
   | Key | Value |
   |---|---|
   | `PORT` | `5000` |
   | `DB_HOST` | `<Your Cloud DB Host>` |
   | `DB_PORT` | `<Your Cloud DB Port, e.g. 4000>` |
   | `DB_USER` | `<Your Cloud DB User>` |
   | `DB_PASSWORD` | `<Your Cloud DB Password>` |
   | `DB_NAME` | `test` (or `college_erp`) |
   | `DB_SSL` | `true` |
   | `JWT_SECRET` | `college_erp_jwt_secret_token_123!@#` |
7. Click **Create Web Service**.
8. Once deployed, Render will generate your free HTTPS URL:
   `https://college-erp-backend-xxxx.onrender.com`

### Step 5: Connect Website to Backend
1. Visit your live site: [https://unknown-0703.github.io/DBSE_DBD_Project/app/#/login](https://unknown-0703.github.io/DBSE_DBD_Project/app/#/login)
2. Click **Server Config** in the top-right corner.
3. Enter your Render backend URL (e.g. `https://college-erp-backend-xxxx.onrender.com`).
4. Click **Test Connection** -> `✅ Successfully connected to Express backend & MySQL database!`.
5. Click **Save & Apply**.
6. Sign in or register new students. Open **MySQL Workbench**, right-click `users` or `students` table, and click **Select Rows** — you will see your live data!

---

## ⚡ Method 2: Localhost Tunneling (Keep MySQL Strictly on Local Laptop)
If you do not want to use cloud hosting and want data stored strictly in your local laptop's MySQL Workbench:

1. **Start your local MySQL database**:
   ```powershell
   .\start-project.ps1
   ```
   *(Or run your local MySQL service in MySQL Workbench on port 3306/3307).*

2. **Start the backend server**:
   ```powershell
   cd server
   node index.js
   ```

3. **Expose your local backend via HTTPS Tunnel**:
   Open a new PowerShell window and run:
   ```powershell
   npx localtunnel --port 5000
   ```
   *(Or using Cloudflare Tunnel: `cloudflared tunnel --url http://localhost:5000`)*
   This gives you an instant HTTPS URL (e.g. `https://smart-college-erp.loca.lt`).

4. **Connect GitHub Pages to Tunnel**:
   - Open [https://unknown-0703.github.io/DBSE_DBD_Project/app/#/login](https://unknown-0703.github.io/DBSE_DBD_Project/app/#/login)
   - Click **Server Config**, paste the tunnel URL, and click **Save & Apply**!

---

## 🔑 Default Test Accounts
- **Admin**: `admin@college.edu` / `AdminPassword123`
- **Faculty**: `prasadbabu@college.edu` / `Prasadbabu123`
- **Student**: `sunil@college.edu` / `SunilPassword123`
