# Zoho CRM Widget Studio

A standalone developer IDE for building, previewing, debugging, and testing Zoho CRM widgets with high-fidelity SDK simulation, an embedded SQLite mock CRM engine, and an SSRF-protected third-party API playground.

---

## 📑 Table of Contents

- [Overview & Capabilities](#overview--capabilities)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Quick Start on Windows](#quick-start-on-windows)
- [Supported Widget Types](#supported-widget-types)
- [SDK Compatibility Matrix](#sdk-compatibility-matrix)
- [Sample Projects (Included)](#sample-projects-included)
- [Mock CRM Database Engine](#mock-crm-database-engine)
- [Third-Party API Playground](#third-party-api-playground)
- [Real Zoho CRM OAuth Integration](#real-zoho-crm-oauth-integration)
- [Security Architecture](#security-architecture)
- [Development & Testing Commands](#development--testing-commands)
- [Production Build & Deployment](#production-build--deployment)
- [Troubleshooting](#troubleshooting)

---

## 🌟 Overview & Capabilities

Zoho CRM Widget Studio enables developers to build custom Zoho widgets without requiring an active paid Zoho CRM tenant. 

- **Full Lifecycle IDE**: Code in Monaco Editor with syntax highlighting, search/replace, diagnostics, multi-tab editing, auto-save, and formatting.
- **Embedded App SDK Simulation**: Full simulation of `window.ZOHO`, including `init()`, `on("PageLoad")`, `ZOHO.CRM.API.*`, `ZOHO.CRM.UI.*`, and `ZOHO.CRM.CONFIG.*`.
- **Live Preview Runtime**: Sandboxed execution with device presets (Responsive, Web Tab, Related List, Modal Popup, Mobile Viewport), PageLoad context configurator, latency simulation, and fault injection.
- **Interactive DevTools**: Intercepted browser console logs, SDK call history with parameter and response inspector, network telemetry, and runtime error traces.
- **Mock CRM Database**: Persistent SQLite database storing standard modules (Deals, Contacts, Accounts, Leads, Tasks, Calls, Meetings, Products) and custom modules with schema definitions and relationships.
- **REST API Playground**: Configure mock HTTP endpoints or test external APIs through an SSRF-protected proxy.
- **Optional Live Zoho OAuth**: Secure server-side OAuth 2.0 flow for regional Zoho domains (.com, .eu, .in, .com.au, .com.cn, .ca) with token refresh and credential isolation.

---

## 🏗️ Architecture & Tech Stack

```
zoho-crm-widget-studio/
├── shared/             # TypeScript domain models, CRM schemas, SDK protocols
├── server/             # Express server, SQLite DB, SDK simulator, Mock endpoints & SSRF proxy
├── client/             # React 18, Vite, Monaco Editor, Tailwind CSS, Lucide icons, IndexedDB
└── e2e/                # Playwright end-to-end integration test suite
```

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Monaco Editor (`@monaco-editor/react`).
- **Backend**: Node.js, Express, `better-sqlite3`, `axios`, `jszip`.
- **Browser State**: IndexedDB for persistent UI preferences, open tabs, and active project state.
- **Sandboxed Runtime**: `<iframe>` with `sandbox="allow-scripts allow-forms allow-modals"`, served with Content Security Policy headers and controlled `postMessage` protocol.

---

## 🚀 Quick Start on Windows

### Prerequisites
- **Node.js**: v18.0.0 or later (Node 20 LTS recommended).
- **npm**: v9.0.0 or later.

### Option 1: Double-click Launcher
Simply double-click:
```cmd
start.bat
```

### Option 2: Command Line
```powershell
# 1. Install dependencies
npm install

# 2. Build shared models, client, and server
npm run build

# 3. Start the application
npm start
```

Open your browser to:
```
http://127.0.0.1:3001
```

### Option 3: Development Mode (Hot Reload)
To run frontend and backend with hot-reloading:
```powershell
npm run dev
```
- Client runs on `http://127.0.0.1:3000` (proxies `/api`, `/preview`, `/sdk` to 3001)
- Backend runs on `http://127.0.0.1:3001`

---

## 📦 Supported Widget Types

1. **Standalone HTML, CSS, JavaScript Widgets**:
   - Pure vanilla JS widgets using standard DOM APIs and `<script src="/sdk/ZohoEmbededAppSDK.js"></script>`.
2. **Zoho Embedded App SDK Widgets**:
   - Widgets that register `ZOHO.embeddedApp.on("PageLoad")` and call `ZOHO.CRM.API.*`.
3. **React / Bundled Widgets**:
   - Pre-bundled or Vite-compatible HTML/JS single-page applications.

---

## 📊 SDK Compatibility Matrix

| API / Method | Category | Status | Supported in Simulator | Notes |
|:---|:---|:---:|:---:|:---|
| `ZOHO.embeddedApp.init()` | Lifecycle | **Simulated** | ✅ Yes | Resolves promise and emits `SDK_READY` handshake. |
| `ZOHO.embeddedApp.on("PageLoad", cb)` | Lifecycle | **Simulated** | ✅ Yes | Delivers configured Entity & EntityId context payload. |
| `ZOHO.embeddedApp.Trigger(event, data)` | Lifecycle | **Simulated** | ✅ Yes | Broadcasts custom widget events across frames. |
| `ZOHO.CRM.API.getRecord({ Entity, RecordID })` | CRM API | **Simulated** | ✅ Yes | Fetches record from SQLite mock DB or live Zoho CRM. |
| `ZOHO.CRM.API.getAllRecords(params)` | CRM API | **Simulated** | ✅ Yes | Supports pagination (`page`, `per_page`), sorting. |
| `ZOHO.CRM.API.insertRecord({ Entity, APIData })` | CRM API | **Simulated** | ✅ Yes | Validates required fields, generates Zoho IDs. |
| `ZOHO.CRM.API.updateRecord({ Entity, APIData })` | CRM API | **Simulated** | ✅ Yes | Updates existing fields and records modification time. |
| `ZOHO.CRM.API.deleteRecord({ Entity, RecordID })` | CRM API | **Simulated** | ✅ Yes | Removes record from database. |
| `ZOHO.CRM.API.searchRecord(params)` | CRM API | **Simulated** | ✅ Yes | Searches text and criteria across all record fields. |
| `ZOHO.CRM.UI.Record.open({ Entity, RecordID })` | CRM UI | **Simulated** | ✅ Yes | Logs simulated navigation event to native CRM page. |
| `ZOHO.CRM.UI.Popup.close()` | CRM UI | **Simulated** | ✅ Yes | Closes active widget dialog. |
| `ZOHO.CRM.UI.Popup.closeReload()` | CRM UI | **Simulated** | ✅ Yes | Closes active dialog and triggers reload signal. |
| `ZOHO.CRM.CONFIG.getCurrentUser()` | CRM Config | **Simulated** | ✅ Yes | Returns active simulated user profile and permissions. |
| `ZOHO.CRM.CONFIG.getOrgInfo()` | CRM Config | **Simulated** | ✅ Yes | Returns company name, currency symbol, and timezone. |
| `ZOHO.CRM.CONNECTIONS.invoke(conn, req)` | Connections | **Real Only** | ⚠️ Fallback | Direct proxy in Real Mode; mock fallback in simulation. |
| `ZOHO.CRM.BLUEPRINT.proceed()` | Blueprint | **Unsupported** | ❌ No | Requires live Zoho CRM configured Blueprint transition. |

---

## 📂 Sample Projects (Included)

The studio comes pre-seeded with 8 ready-to-run sample widget projects:

1. **`01 Standalone Contact Form`**: Responsive inquiry form with real-time field validation and submission handling.
2. **`02 Zoho Deals List`**: Data table fetching records using `ZOHO.CRM.API.getAllRecords` with stage badges and currency formatting.
3. **`03 Deal Details Viewer`**: Demonstrates reading `PageLoad` context (`Entity`, `EntityId`) and loading details via `ZOHO.CRM.API.getRecord`.
4. **`04 CRM Record Creation Form`**: Form inserting new Leads into CRM with validation via `ZOHO.CRM.API.insertRecord`.
5. **`05 CRM Record Update Form`**: Fetches deal, binds to input controls, and modifies Stage and Value with `ZOHO.CRM.API.updateRecord`.
6. **`06 CRM Metrics Dashboard`**: Executive analytics widget computing Total Pipeline Value, Win Rate, and stage distributions.
7. **`07 Third-Party REST API Demo`**: Widget consuming a simulated REST API (`/api/v1/weather/forecast`).
8. **`08 API Failure & Error Handling`**: Simulates HTTP 503 service outage and missing records, demonstrating resilient retry patterns.

---

## 🗄️ Mock CRM Database Engine

- **Persistence**: Backed by SQLite (`studio.sqlite3`) with WAL journal mode.
- **Pre-populated Modules**:
  - `Deals`: Deal Name, Amount, Stage, Closing Date, Probability, Account Name, Contact Name.
  - `Contacts`: First Name, Last Name, Email, Phone, Title, Account Name, Mailing Address.
  - `Accounts`: Account Name, Phone, Website, Industry, Annual Revenue, Billing City.
  - `Leads`: First/Last Name, Company, Email, Phone, Lead Status, Annual Revenue.
  - `Tasks`, `Calls`, `Meetings`, `Products`: Full field definitions and sample records.
- **Custom Modules & Fields**: Add custom modules and custom picklists directly from the **Mock CRM** panel.
- **Reset to Demo Data**: Click "Reset" anytime to restore clean fixtures.

---

## 🌐 Third-Party API Playground

- **Mock Endpoints**: Register custom HTTP routes (e.g. `GET /api/v1/weather/forecast`, `POST /api/v1/notifications/sms`, or `GET /api/v1/service-status/unstable`) with configurable status codes, JSON responses, and response latency.
- **Direct Wildcard Route**: Preview widgets can query registered mock endpoints directly via standard `fetch('/api/v1/...')`.
- **SSRF-Protected Live Proxy**: External URLs requested in the Playground pass strict DNS resolution checks that block private networks (127.0.0.0/8, 10.0.0.0/8, 192.168.0.0/16, 172.16.0.0/12, 169.254.169.254).

---

## 🔑 Real Zoho CRM OAuth Integration

To switch from Mock mode to a real Zoho CRM environment:

1. Open the **Zoho CRM Integration** tab in the left sidebar.
2. Select your data center region (`.com`, `.eu`, `.in`, `.com.au`, `.com.cn`, `.ca`).
3. Enter your **Client ID**, **Client Secret**, and **OAuth Refresh Token**.
4. Click **Test** to verify connection.
5. Switch the Environment selector in the top toolbar to **Env: Real Zoho**.

> [!NOTE]
> Client secrets and refresh tokens are stored exclusively on the local backend database (`studio.sqlite3`) and are never sent to browser code, preview iframes, or exported ZIP archives.

---

## 🔒 Security Architecture

1. **Sandboxed Iframe**: `sandbox="allow-scripts allow-forms allow-modals"`. The preview frame does not have `allow-same-origin`, preventing untrusted widget code from accessing parent Studio storage or cookies.
2. **Zip Slip Protection**: The ZIP importer strictly normalizes relative paths and throws `Security Violation` if directory traversal (`../`) is detected.
3. **SSRF Guard**: The API proxy validates that target hosts do not resolve to loopback, link-local, or private RFC 1918 subnets.
4. **No Arbitrary Backend Execution**: Widget preview code communicates strictly over a validated postMessage protocol.

---

## 🧪 Development & Testing Commands

```powershell
# Run backend unit and integration tests (Vitest)
npm run test:server

# Run frontend component tests (Vitest)
npm run test:client

# Run Playwright End-to-End tests
npm run test:e2e

# Run all test suites
npm test
```

---

## 🚢 Production Build & Deployment

### Production Build
```powershell
npm run build
```
This compiles the `@zoho-studio/shared` package, bundles the `@zoho-studio/client` frontend using Vite into `client/dist`, and compiles `@zoho-studio/server` with TypeScript into `server/dist`.

### Starting in Production
```powershell
set PORT=3001
set HOST=127.0.0.1
node server/dist/index.js
```

### Remote Hosting Requirements
If deploying to a server (e.g. AWS EC2, DigitalOcean, or Docker container):
- Place the application behind an HTTPS reverse proxy (e.g., Nginx, Caddy, or Cloudflare).
- Set `HOST=0.0.0.0` and configure firewall rules.
- Set `DB_PATH=/var/data/studio.sqlite3` on a persistent volume.
- Configure authorized redirect URIs in Zoho API Console to match your public domain.

---

## 🔧 Troubleshooting

| Symptom | Cause | Solution |
|:---|:---|:---|
| Port 3001 already in use | Another process is listening on port 3001. | Set `PORT=3002` before starting, or terminate the conflicting process. |
| Preview shows "PageLoad not triggered" | Widget did not call `ZOHO.embeddedApp.init()`. | Ensure widget script includes `ZOHO.embeddedApp.init()` at entry point. |
| SSRF blocked error in Playground | Target URL resolved to a localhost or private IP address. | External requests must point to public domains (e.g. `https://httpbin.org`). |
| ZIP import error | Archive lacks entry file or contains invalid compression. | Ensure archive contains an `app.html` or `index.html` file. |

---

## 📜 License
MIT License. Built for professional Zoho CRM widget developers.
