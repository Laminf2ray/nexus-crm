# 📖 NexusCRM — Technical Documentation

> Full technical reference for developers working with, extending, or deploying NexusCRM.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Component Reference](#2-component-reference)
3. [Data Models](#3-data-models)
4. [State Management](#4-state-management)
5. [Email System](#5-email-system)
6. [Pipeline Logic](#6-pipeline-logic)
7. [Deployment Guide](#7-deployment-guide)
8. [Environment Configuration](#8-environment-configuration)
9. [Extending the CRM](#9-extending-the-crm)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Architecture Overview

NexusCRM follows a **single-file component architecture** for maximum portability and simplicity. The entire application lives in `crm-system.jsx` and is composed of:

```
CRMApp (root)
├── Sidebar (navigation)
├── TopBar (search + actions)
└── Content (view router)
    ├── Dashboard View
    │   ├── MetricCard ×4
    │   ├── Pipeline Bar Chart
    │   └── Activity Feed
    ├── Leads View
    │   └── Lead Table + Filters
    ├── Pipeline View
    │   └── PipelineView (Kanban)
    │       └── Lead Cards ×n
    └── Email View
        ├── Campaign Analytics
        └── Template Library
```

**Modals (overlays):**
- `LeadModal` — lead detail, notes, stage change, email launch
- `EmailComposer` — template selection, lead targeting, send simulation
- `AddLeadModal` — new lead form

**Utility components:**
- `Avatar` — initials-based avatar with deterministic colour
- `Badge` — coloured tag chip
- `StageDot` — coloured stage indicator dot
- `MetricCard` — KPI metric display card

---

## 2. Component Reference

### `CRMApp`
Root component. Manages all global state and renders the sidebar + active view.

| State | Type | Description |
|-------|------|-------------|
| `leads` | `Lead[]` | All lead records |
| `view` | `string` | Active navigation view |
| `search` | `string` | Global search query |
| `filterStage` | `string` | Active stage filter in leads view |
| `selectedLead` | `Lead \| null` | Lead open in detail modal |
| `showEmail` | `boolean` | Email composer visibility |
| `emailTo` | `Lead \| null` | Pre-selected lead for email |
| `showAddLead` | `boolean` | Add lead modal visibility |
| `sentCount` | `number` | Running email sent counter |
| `notification` | `string \| null` | Toast notification message |

---

### `PipelineView`
Renders a horizontal kanban board grouped by pipeline stage.

| Prop | Type | Description |
|------|------|-------------|
| `leads` | `Lead[]` | Filtered lead array |
| `onStageChange` | `(id, stage) => void` | Callback when stage is changed |

Each stage column shows the aggregate deal value and individual lead cards with Advance/Back controls.

---

### `EmailComposer`
Full email composition modal with template support and SendGrid simulation.

| Prop | Type | Description |
|------|------|-------------|
| `leads` | `Lead[]` | All leads for recipient selection |
| `onClose` | `() => void` | Close modal callback |
| `onSent` | `() => void` | Called after successful send |

Template variables `{name}`, `{company}`, `{sender}` are automatically substituted when a recipient is selected.

---

### `LeadModal`
Detail overlay for a single lead. Supports inline stage editing and notes.

| Prop | Type | Description |
|------|------|-------------|
| `lead` | `Lead` | The lead to display |
| `onClose` | `() => void` | Close callback |
| `onUpdate` | `(id, patch) => void` | Partial lead update callback |
| `onEmail` | `(lead) => void` | Launch email composer for this lead |

---

### `AddLeadModal`
Form modal for creating new leads.

| Prop | Type | Description |
|------|------|-------------|
| `onClose` | `() => void` | Close callback |
| `onAdd` | `(lead) => void` | New lead callback |

---

### `MetricCard`
KPI metric display widget.

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Metric label |
| `value` | `string` | Formatted metric value |
| `delta` | `number` | Month-over-month % change |
| `icon` | `string` | Emoji icon |
| `color` | `string` | Accent colour hex |

---

### `Avatar`
Initials-based avatar circle.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initials` | `string` | — | 1–2 character initials |
| `size` | `number` | `36` | Diameter in px |
| `color` | `string` | `#6366f1` | Background colour |

---

## 3. Data Models

### Lead Object

```typescript
interface Lead {
  id: number;                  // Unique identifier
  name: string;                // Full name
  company: string;             // Company name
  email: string;               // Email address
  phone: string;               // Phone number
  value: number;               // Deal value in USD
  stage: PipelineStage;        // Current pipeline stage
  source: string;              // Lead source (LinkedIn, Referral, etc.)
  assigned: string;            // Assigned sales rep name
  lastContact: string;         // ISO date string (YYYY-MM-DD)
  tags: string[];              // Array of tag labels
  avatar: string;              // 2-char initials string
}
```

### Pipeline Stages

```typescript
type PipelineStage =
  | "New"
  | "Qualified"
  | "Proposal"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost";
```

### Email Template

```typescript
interface EmailTemplate {
  id: number;
  name: string;      // Template display name
  subject: string;   // Subject line (supports {name}, {company} variables)
  body: string;      // Body text (supports {name}, {company}, {sender} variables)
}
```

### Campaign

```typescript
interface Campaign {
  name: string;
  sent: number;
  opened: number;
  clicked: number;
  status: "Active" | "Paused" | "Completed";
}
```

---

## 4. State Management

NexusCRM uses **React `useState` only** — no Redux, Zustand, or Context API required at this scale. All shared state lives in the root `CRMApp` component and is passed down via props.

### Key derived values (computed inline)

```js
// Total value of active pipeline (excluding Closed Won/Lost)
const totalPipelineValue = leads
  .filter(l => !["Closed Won", "Closed Lost"].includes(l.stage))
  .reduce((sum, l) => sum + l.value, 0);

// Closed Won revenue
const closedWon = leads
  .filter(l => l.stage === "Closed Won")
  .reduce((sum, l) => sum + l.value, 0);

// Filtered leads (search + stage filter)
const filteredLeads = leads.filter(l => {
  const q = search.toLowerCase();
  const matchesSearch = !q || l.name.toLowerCase().includes(q) ||
    l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
  const matchesStage = filterStage === "All" || l.stage === filterStage;
  return matchesSearch && matchesStage;
});
```

### Updating a lead

```js
const updateLead = (id, patch) => {
  setLeads(ls => ls.map(l => l.id === id ? { ...l, ...patch } : l));
  notify("Lead updated ✓");
};

// Usage — change stage:
updateLead(3, { stage: "Proposal" });

// Usage — update multiple fields:
updateLead(3, { stage: "Closed Won", lastContact: "2026-02-20" });
```

---

## 5. Email System

### Current Implementation (Simulated)

The `EmailComposer` component simulates a 1.5-second send delay then displays a success state. This is suitable for demos and portfolio showcases.

### Connecting Real SendGrid

Replace the `handleSend` function in `EmailComposer` with:

```js
const handleSend = async () => {
  setSending(true);
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: import.meta.env.VITE_SENDGRID_FROM_EMAIL },
        subject: subject,
        content: [{ type: "text/plain", value: body }],
      }),
    });
    if (response.ok) {
      setSent(true);
      onSent && onSent();
      setTimeout(onClose, 1500);
    } else {
      alert("Failed to send email. Check your API key.");
    }
  } catch (err) {
    console.error(err);
    alert("Network error. Please try again.");
  } finally {
    setSending(false);
  }
};
```

> ⚠️ **Important:** Never call the SendGrid API directly from a browser in production — your API key will be exposed. Use a backend proxy (Node.js serverless function on Vercel, or a PHP endpoint on Hostinger).

### Recommended Backend Proxy (Vercel Serverless)

Create `/api/send-email.js`:

```js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { to, subject, body } = req.body;
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: process.env.SENDGRID_FROM_EMAIL },
      subject,
      content: [{ type: "text/plain", value: body }],
    }),
  });
  res.status(response.ok ? 200 : 500).json({ ok: response.ok });
}
```

Then update the frontend call to `fetch("/api/send-email", { method: "POST", ... })`.

---

## 6. Pipeline Logic

### Stage Order

```
New → Qualified → Proposal → Negotiation → Closed Won
                                          ↘ Closed Lost
```

Defined in:
```js
const PIPELINE_STAGES = ["New", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
```

### Stage Colours

Each stage has a dedicated hex colour used for dots, kanban headers, and badges:

```js
const STAGE_COLORS = {
  "New":          "#64748b",   // Slate
  "Qualified":    "#3b82f6",   // Blue
  "Proposal":     "#8b5cf6",   // Violet
  "Negotiation":  "#f59e0b",   // Amber
  "Closed Won":   "#10b981",   // Emerald
  "Closed Lost":  "#ef4444",   // Red
};
```

### Kanban Advancement

The `PipelineView` component maps each lead's current stage to its index in `PIPELINE_STAGES`. Advance/Back buttons call `onStageChange(lead.id, newStage)` which propagates to `updateLead` in the root component.

---

## 7. Deployment Guide

### Option A — Vercel (Recommended)

Vercel provides the fastest CI/CD pipeline for React/Vite apps.

**Step 1: Push to GitHub**
```bash
git init
git add .
git commit -m "feat: initial NexusCRM release"
git remote add origin https://github.com/YOUR_USERNAME/nexus-crm.git
git push -u origin main
```

**Step 2: Import to Vercel**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects Vite — no config needed
4. Add environment variables under **Settings → Environment Variables**
5. Click **Deploy**

Every `git push` to `main` will trigger an automatic redeploy.

---

### Option B — Netlify

**Step 1: Build**
```bash
npm run build
```

**Step 2: Deploy via CLI**
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod --dir=dist
```

Or drag and drop the `/dist` folder at [netlify.com/drop](https://app.netlify.com/drop).

**netlify.toml** (already included):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option C — Hostinger Static Hosting

**Step 1: Build**
```bash
npm run build
```

**Step 2: Upload**
1. Log into your Hostinger control panel
2. Go to **File Manager → public_html**
3. Delete the default `index.html`
4. Upload all contents of the `/dist` folder
5. Ensure `.htaccess` is present for SPA routing (included below)

**.htaccess** (for React Router support):
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

---

## 8. Environment Configuration

### `.env` (local development)

```env
VITE_SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
VITE_SENDGRID_FROM_EMAIL=crm@yourdomain.com
VITE_APP_SENDER_NAME=Alex Martinez
VITE_APP_NAME=NexusCRM
```

### `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
```

---

## 9. Extending the CRM

### Adding a new pipeline stage

1. Add the stage string to `PIPELINE_STAGES` array
2. Add a colour entry to `STAGE_COLORS`
3. All views (Kanban, filters, modals) automatically pick it up

### Adding a new lead field

1. Add the field to the `Lead` interface / mock data
2. Display it in `LeadModal` grid
3. Add an input in `AddLeadModal`
4. Update the table columns in the Leads view if needed

### Adding persistent storage

Replace `useState(INITIAL_LEADS)` with:

```js
const [leads, setLeads] = useState(() => {
  const saved = localStorage.getItem("crm_leads");
  return saved ? JSON.parse(saved) : INITIAL_LEADS;
});

// Persist on every update
useEffect(() => {
  localStorage.setItem("crm_leads", JSON.stringify(leads));
}, [leads]);
```

For a real backend, swap `localStorage` with `fetch` calls to your REST API.

---

## 10. Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| White screen on deploy | Base path misconfigured | Add `base: './'` to `vite.config.js` |
| 404 on page refresh | SPA routing not configured | Add `.htaccess` (Hostinger) or `vercel.json` redirects |
| Fonts not loading | CSP blocking Google Fonts | Add `fonts.googleapis.com` to your CSP headers |
| Email not sending | SendGrid API key invalid | Verify key in SendGrid dashboard → API Keys |
| Build fails | Node version mismatch | Use Node `>= 18` — run `node --version` to check |
| Leads reset on refresh | No persistence layer | Add `localStorage` or backend as described in §9 |

---

*Documentation maintained by Touray Solutions · Last updated: February 2026*
