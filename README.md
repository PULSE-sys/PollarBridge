# PollarBridge (AFR-LATAM Settlement Rail)

An enterprise-grade cross-continental settlement corridor connecting West African banking infrastructure with Latin American liquidity networks via the Stellar Network and Pollar SDK. Built for the **Pollar Hackathon Flagship Challenge**.

## 🌐 The Problem & The Solution

### The Friction
Currently, routing fiat currency from West Africa (NGN) to South America (BOB) requires multiple corresponding US or European legacy banks. This process incurs up to 15% in intermediate FX fees, creates massive tracking blind spots, and delays clearing times by 5–7 business days.

### The Innovation
**PollarBridge** opens a direct, automated liquidity corridor. By integrating local African banking webhook flows with atomic Stellar network settlement primitives and Pollar’s live Bolivian fiat off-ramp, cross-continental transactions settle in **under 5 seconds** for near-zero cost.

---

## 🏗️ System Architecture

```text
[African Sender]
       │ (Mocks NGN via Bank Transfer / Mobile Money Webhook)
       ▼
[PollarBridge Express Node]
       │ (Atomically constructs, signs, and executes Stellar Testnet transaction)
       ▼
[Stellar Horizon Network]
       │ (Near-instant, zero-cost asset settlement on Testnet)
       ▼
[Pollar LatAm SDK Engine]
       │ (Ingests transaction payload & initiates live BOB clearing)
       ▼
[Bolivian Recipient]
       (Receives Bolivian Bolivianos directly into local account)
```

---

## ⚡ Core Technical Features & Implementations

* **Enterprise Minimalist Design:** Built using a strict, layout-driven design tokens system via React and Tailwind CSS (`bg-slate-50` canvas, dense matte `bg-[#0B0F19]` terminal, crisp `border-slate-200/80` dividers).
* **Official Pollar SDK Integration:** Fully integrated with `@pollar/react` and `@pollar/core`. Wraps the dashboard in `<PollarProvider>` with active testnet credentials (`pub_testnet_*`) and native passkey/wallet authentication triggers (`usePollar`, `<WalletButton />`).
* **Live Cryptographic Node Monitor:** The UI incorporates a dedicated asynchronous state terminal that actively traces transaction pipeline stages from internal intake up to raw live blockchain confirmation and Pollar LatAm payload dispatching (`pol_latam_*`).
* **Stellar Horizon Network Integration:** Fully integrated with `@stellar/stellar-sdk (v13+)` on the Stellar Testnet. Backend route dynamically processes real-time transaction compilation, cryptographic signing, and node submission using a funded 10,000 XLM testnet gateway.
* **Gas-Abstracted Architecture:** Aligns directly with Pollar's key engineering ethos by mapping out platform-sponsored transaction fees (0.00 XLM / $0.00). The user handles only native local currency; all lower-level network gas structures are completely hidden.

---

## 🛠️ Workspace Directories

The application is structured as a cleanly orchestrated monorepo:
* `/backend` - Node.js Express server acting as the local financial rail controller, Stellar Horizon engine router, and Pollar SDK payload dispatcher (`:5001`).
* `/frontend` - Vite + React 18 frontend dashboard powered by `@pollar/react` & Tailwind CSS (`:3000`).

---

## 🚀 Step-by-Step Installation & Booting

### 1. Prerequisite Environments
Ensure you have `Node.js (v18+)` and `npm` installed globally.

### 2. Install All Dependencies
From the root repository file path, install the unified packages across both folders simultaneously:
```bash
npm install
```

### 3. Cryptographic Environment Keys
The application is pre-configured with operational testnet credentials for immediate zero-config startup:
* **Stellar Testnet Secret**: Configured in `/backend/server.js` (`SCV2MI7OGVAHNW...`, funded with 10,000 XLM).
* **Pollar SDK API Key**: Configured in `/frontend/src/Dashboard.jsx` and `/backend/server.js`:
  ```javascript
  const POLLAR_API_KEY = "pub_testnet_20c047465ff4ae143f584f68f864e145";
  ```

### 4. Execute the Application Workspace
Boot up both developer engines concurrently with a single script execution:
```bash
npm start
```
The browser view terminal will open up instantly at [http://localhost:3000](http://localhost:3000).

---

## 📡 Live Endpoints & Health Check

* **Frontend Dashboard**: `http://localhost:3000`
* **Corridor Initiate**: `POST http://localhost:5001/api/v1/corridor/initiate`
* **Pollar Off-Ramp Relay**: `POST http://localhost:5001/api/v1/pollar/offramp`
* **System Health Check**: `GET http://localhost:5001/health`

---

## 🏆 Submission Milestones
* **Core Engine Execution:** Successfully executing live Testnet asset transfers returning cryptographic block hashes.
* **Official SDK Compliance:** End-to-end integration with `@pollar/react`, `@pollar/core`, and real `pub_testnet_` authentication.
* **UI/UX Infrastructure:** Production-grade light/dark split interface modeling exact fintech flows with flat design tokens.
* **Flagship Track Compliance:** Completely focused on bridging the Global South's emerging market corridors (NGN ➔ USDC ➔ BOB).
