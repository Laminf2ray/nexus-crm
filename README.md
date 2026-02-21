# ⚡ NexusCRM — Sales Intelligence Platform

> A production-ready, full-featured CRM system built with React. Manage leads, visualise your sales pipeline, and send automated emails — all in one sleek interface.

![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Made by](https://img.shields.io/badge/Made%20by-Touray%20Solutions-6366f1)

---

## 📸 Preview

| Dashboard | Pipeline Kanban | Lead Detail | Email Composer |
|-----------|----------------|-------------|----------------|
| KPI cards, pipeline charts, activity feed | Kanban board with stage advancement | Full lead profile, notes, stage mover | Template-powered email sending |

---

## ✨ Features

- **📊 Dashboard** — Real-time KPI metrics (pipeline value, closed revenue, lead count, emails sent), stage distribution bar chart, and live activity feed
- **👥 Lead Management** — Full lead table with search, stage filtering, avatar initials, deal values, tags, and quick actions
- **🗂 Pipeline Kanban** — Visual kanban board with one-click stage advancement and back-movement across all pipeline stages
- **✉ Email Campaigns** — SendGrid-ready email composer with 4 auto-filling templates, campaign analytics (open rate, click rate), and template library
- **➕ Lead Creation** — Full form to add new leads with name, company, email, phone, deal value, stage, source, and assignment
- **📝 Lead Detail Modal** — Deep-dive view per lead with editable notes, stage changer, and direct email launch
- **🔔 Notifications** — Real-time toast notifications for all CRM actions

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Styling | CSS-in-JS (inline styles, zero dependencies) |
| Fonts | Google Fonts — DM Sans + DM Mono |
| Email (production) | SendGrid API |
| State Management | React `useState` (no Redux needed) |
| Deployment | Vercel / Netlify / Hostinger |

---

## 🚀 Quick Start

### Prerequisites

- Node.js `>= 18.x`
- npm `>= 9.x` or yarn `>= 1.22`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/nexus-crm.git
cd nexus-crm

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
nexus-crm/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   └── crm-system.jsx     # Main CRM application (single-file architecture)
│   ├── App.jsx                # Root component
│   └── main.jsx               # React entry point
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── vercel.json                # Vercel deployment config
├── netlify.toml               # Netlify deployment config
├── README.md
└── DOCUMENTATION.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root for production email sending:

```env
VITE_SENDGRID_API_KEY=your_sendgrid_api_key_here
VITE_SENDGRID_FROM_EMAIL=noreply@yourdomain.com
VITE_APP_SENDER_NAME=Your Name
```

> ⚠️ Never commit `.env` to version control. It is already listed in `.gitignore`.

---

## 📦 Available Scripts

```bash
npm run dev        # Start development server (http://localhost:5173)
npm run build      # Build for production (outputs to /dist)
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) for automatic deployments on every push.

### Netlify

```bash
npm run build
# Drag and drop the /dist folder to netlify.com/drop
```

Or via CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Hostinger / cPanel (Static)

```bash
npm run build
# Upload contents of /dist to your public_html folder via FTP or File Manager
```

See [DOCUMENTATION.md](./DOCUMENTATION.md) for full deployment walkthrough.

---

## 🔌 Connecting SendGrid (Production Email)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key under **Settings → API Keys**
3. Add it to your `.env` file as `VITE_SENDGRID_API_KEY`
4. In `crm-system.jsx`, replace the simulated `handleSend` with a real `fetch` call to the SendGrid `/v3/mail/send` endpoint

---

## 🗺 Roadmap

- [ ] Backend API (Node.js / Express or PHP)
- [ ] MySQL database integration for persistent lead storage
- [ ] Real SendGrid email dispatch
- [ ] User authentication (JWT)
- [ ] CSV import/export for leads
- [ ] Reporting & analytics charts (Recharts)
- [ ] Mobile-responsive layout

---

## 👤 Author

**Lamin Touray**
Founder, [Touray Solutions](https://toursolutions.com)
Website Development · Data Analytics · Custom Software

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

---

*Built with ⚡ by Touray Solutions*
