/**
 * KowoPay Platform Configuration & Client-Side Storage Engine
 * Engineered for static GitHub Pages deployment (oluwafemoli.github.io/kowopay/)
 * By Boge Expression
 */
window.KOWOPAY_CONFIG = {
  appName: "KowoPay",
  brandAttribution: "Boge Expression",
  currency: "NGN",
  currencySymbol: "₦",
  supportEmail: "support@kowopay.ng",
  adminDefaultEmail: "admin@kowopay.ng",
  adminDefaultPassword: "Admin@KowoPay2026",
  demoUserEmail: "demo@kowopay.ng",
  demoUserPassword: "Demo@1234",
  storageKeys: {
    USERS: "kp_users_v1",
    SESSION: "kp_active_session_v1",
    ADMIN_SESSION: "kp_admin_session_v1",
    TRANSACTIONS: "kp_transactions_v1",
    CARDS: "kp_cards_v1",
    SETTINGS: "kp_platform_settings_v1"
  },
  // Optional Firebase config placeholder if you ever wish to connect live cloud auth/DB
  firebase: {
    enabled: false,
    apiKey: "",
    authDomain: "",
    projectId: ""
  }
};

(function initKowoPayStore() {
  const K = window.KOWOPAY_CONFIG.storageKeys;

  const defaultSettings = {
    maintenanceMode: false,
    transferFeeFlat: 10,
    virtualCardCreationFee: 1500,
    dailyTransferLimit: 5000000,
    airtimeCashbackPercent: 2.0,
    announcement: "Zero fees on your first 5 bank transfers every week!"
  };

  if (!localStorage.getItem(K.SETTINGS)) {
    localStorage.setItem(K.SETTINGS, JSON.stringify(defaultSettings));
  }

  const existingUsers = JSON.parse(localStorage.getItem(K.USERS) || "[]");
  if (existingUsers.length === 0) {
    const seedUsers = [
      {
        id: "USR-1001",
        fullName: "Babalola Oluwafemi Emmanuel",
        email: "demo@kowopay.ng",
        phone: "08031234567",
        password: "Demo@1234",
        pin: "1234",
        accountNumber: "9042817365",
        bankName: "KowoPay Microfinance Bank",
        walletBalance: 245850.00,
        cashbackBalance: 1420.50,
        kycTier: "Tier 3 (Verified)",
        status: "active",
        createdAt: "2026-10-12T09:15:00.000Z"
      },
      {
        id: "USR-1002",
        fullName: "Chidinma Okafor",
        email: "chidinma.o@example.ng",
        phone: "08129876543",
        password: "User@1234",
        pin: "4321",
        accountNumber: "9048192044",
        bankName: "KowoPay Microfinance Bank",
        walletBalance: 84200.00,
        cashbackBalance: 350.00,
        kycTier: "Tier 2",
        status: "active",
        createdAt: "2026-10-25T14:30:00.000Z"
      },
      {
        id: "USR-1003",
        fullName: "Ibrahim Musa",
        email: "ibrahim.m@example.ng",
        phone: "07065554433",
        password: "User@1234",
        pin: "1111",
        accountNumber: "9047712901",
        bankName: "KowoPay Microfinance Bank",
        walletBalance: 15000.00,
        cashbackBalance: 0.00,
        kycTier: "Tier 1",
        status: "suspended",
        createdAt: "2026-11-01T11:05:00.000Z"
      }
    ];
    localStorage.setItem(K.USERS, JSON.stringify(seedUsers));
  }

  const existingTx = JSON.parse(localStorage.getItem(K.TRANSACTIONS) || "[]");
  if (existingTx.length === 0) {
    const seedTx = [
      {
        id: "KP-TX-908412",
        userId: "USR-1001",
        userName: "Babalola Oluwafemi Emmanuel",
        type: "credit",
        category: "Wallet Funding",
        title: "Instant Bank Deposit (GTBank)",
        counterparty: "Self — 012****891",
        amount: 150000.00,
        fee: 0,
        status: "completed",
        reference: "NIP2026111400192",
        date: "2026-11-14T10:22:00.000Z"
      },
      {
        id: "KP-TX-908413",
        userId: "USR-1001",
        userName: "Babalola Oluwafemi Emmanuel",
        type: "debit",
        category: "Bank Transfer",
        title: "Transfer to Chidinma Okafor",
        counterparty: "KowoPay — 9048192044",
        amount: 25000.00,
        fee: 0,
        status: "completed",
        reference: "KWP2026111408831",
        date: "2026-11-14T15:40:00.000Z"
      },
      {
        id: "KP-TX-908414",
        userId: "USR-1001",
        userName: "Babalola Oluwafemi Emmanuel",
        type: "debit",
        category: "Airtime & Data",
        title: "MTN 10GB Monthly Data Bundle",
        counterparty: "08031234567",
        amount: 3500.00,
        fee: 0,
        status: "completed",
        reference: "VTU2026111511209",
        date: "2026-11-15T08:12:00.000Z"
      },
      {
        id: "KP-TX-908415",
        userId: "USR-1001",
        userName: "Babalola Oluwafemi Emmanuel",
        type: "debit",
        category: "Utility Bills",
        title: "EEDC Prepaid Electricity Token",
        counterparty: "Meter 45091827361",
        amount: 12000.00,
        fee: 100,
        status: "completed",
        reference: "PWR2026111519442",
        date: "2026-11-15T18:05:00.000Z"
      },
      {
        id: "KP-TX-908416",
        userId: "USR-1002",
        userName: "Chidinma Okafor",
        type: "debit",
        category: "Bank Transfer",
        title: "Transfer to Zenith Bank Merchant",
        counterparty: "Zenith Bank — 2089182734",
        amount: 485000.00,
        fee: 10,
        status: "pending",
        reference: "NIP2026111609112",
        date: "2026-11-16T09:11:00.000Z"
      }
    ];
    localStorage.setItem(K.TRANSACTIONS, JSON.stringify(seedTx));
  }

  const existingCards = JSON.parse(localStorage.getItem(K.CARDS) || "[]");
  if (existingCards.length === 0) {
    const seedCards = [
      {
        id: "CRD-501",
        userId: "USR-1001",
        label: "KowoPay Virtual USD/NGN",
        cardHolder: "BABALOLA OLUWAFEMI E.",
        maskedNumber: "5399 •••• •••• 4821",
        fullNumber: "5399 8410 2938 4821",
        expiry: "09/29",
        cvv: "842",
        brand: "Mastercard",
        balance: 45000.00,
        frozen: false,
        colorTheme: "blue-black"
      }
    ];
    localStorage.setItem(K.CARDS, JSON.stringify(seedCards));
  }
})();

window.KowoStore = {
  getUsers() {
    return JSON.parse(localStorage.getItem(window.KOWOPAY_CONFIG.storageKeys.USERS) || "[]");
  },
  saveUsers(users) {
    localStorage.setItem(window.KOWOPAY_CONFIG.storageKeys.USERS, JSON.stringify(users));
  },
  getCurrentUser() {
    const sessionId = localStorage.getItem(window.KOWOPAY_CONFIG.storageKeys.SESSION);
    if (!sessionId) return null;
    return this.getUsers().find(u => u.id === sessionId) || null;
  },
  setCurrentUser(userId) {
    localStorage.setItem(window.KOWOPAY_CONFIG.storageKeys.SESSION, userId);
  },
  logoutUser() {
    localStorage.removeItem(window.KOWOPAY_CONFIG.storageKeys.SESSION);
  },
  getTransactions() {
    return JSON.parse(localStorage.getItem(window.KOWOPAY_CONFIG.storageKeys.TRANSACTIONS) || "[]");
  },
  saveTransactions(txs) {
    localStorage.setItem(window.KOWOPAY_CONFIG.storageKeys.TRANSACTIONS, JSON.stringify(txs));
  },
  getCards() {
    return JSON.parse(localStorage.getItem(window.KOWOPAY_CONFIG.storageKeys.CARDS) || "[]");
  },
  saveCards(cards) {
    localStorage.setItem(window.KOWOPAY_CONFIG.storageKeys.CARDS, JSON.stringify(cards));
  },
  getSettings() {
    return JSON.parse(localStorage.getItem(window.KOWOPAY_CONFIG.storageKeys.SETTINGS) || "{}");
  },
  saveSettings(settings) {
    localStorage.setItem(window.KOWOPAY_CONFIG.storageKeys.SETTINGS, JSON.stringify(settings));
  },
  formatMoney(amount) {
    const num = Number(amount) || 0;
    return "₦" + num.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },
  generateAccountNumber() {
    return "904" + Math.floor(1000000 + Math.random() * 9000000).toString();
  }
};
