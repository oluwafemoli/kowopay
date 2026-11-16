# KowoPay — Digital Wallet, Transfers & Virtual Card Platform

**Live Target:** `https://oluwafemoli.github.io/kowopay/`  
**Engineered by:** Boge Expression

## Overview
KowoPay is a complete static-ready fintech web platform designed specifically for zero-backend hosting on **GitHub Pages** (`oluwafemoli.github.io/kowopay/`). Every user and administrative feature operates smoothly in the browser via a structured `localStorage` ledger engine (`config.js`), with optional Firebase hooks ready when you decide to connect a live cloud database.

## Included Modules & Features
1. **Redesigned Fintech Homepage (`index.html`, `styles.css`, `assets/kowopay-logo.svg`)**
   - Obsidian & Electric Blue fintech aesthetic with live announcement ribbon.
   - Interactive wallet preview card, instant fee & cashback calculator, 3-step onboarding guide, and security highlights.
2. **User Authentication (`signup.html`, `login.html`, `auth.js`)**
   - Instant account creation with automatic 10-digit NUBAN generation (`904XXXXXXX`), 4-digit security PIN setup, and ₦5,000 welcome reward.
   - One-click Demo User login (`demo@kowopay.ng` / `Demo@1234`).
3. **User Wallet Dashboard (`dashboard.html`, `dashboard.js`)**
   - **Wallet Funding:** Instant deposit via NIP transfer, card top-up, or USSD.
   - **P2P & Inter-Bank Transfers:** Zero-fee KowoPay-to-KowoPay transfers and NIP transfers to Nigerian banks with 4-digit PIN authorization.
   - **Airtime, Data & Utility Bills:** Mobile top-ups and electricity prepaid token generation with 2% automatic cashback and cashback vault redemption.
   - **Virtual Cards:** Issue virtual Mastercards, reveal/hide PAN & CVV, and freeze/unfreeze cards in one tap.
   - **Receipts & KYC:** Searchable transaction ledger with printable receipts and KYC tier upgrades.
4. **Owner / Admin Command Center (`owner-admin/login.html`, `owner-admin/index.html`, `owner-admin/admin.js`)**
   - Default Admin Login: `admin@kowopay.ng` / `Admin@KowoPay2026`
   - Monitor total platform liquidity, approve or reject/refund flagged high-value transfers, credit user wallets, suspend/activate accounts, and update live transfer fees and homepage announcements.

## Deploying to GitHub Pages
1. Extract the contents of `kowopay-github-pages-rebuild.zip` directly into the root of your `kowopay` repository (`github.com/oluwafemoli/kowopay`).
2. Commit and push to the `main` branch (`git add . && git commit -m "Rebuild KowoPay full platform" && git push`).
3. Ensure GitHub Pages is set to deploy from the `main` branch (`/` root folder). Your site will be live at `https://oluwafemoli.github.io/kowopay/`.
