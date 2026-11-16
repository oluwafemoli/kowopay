/**
 * KowoPay Client-Side Authentication Module
 */
(function () {
  const alertBox = document.getElementById("authAlert");

  function showAlert(msg, type = "error") {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.className = "alert show " + (type === "success" ? "alert-success" : "alert-error");
  }

  // Auto-fill or auto-login if ?demo=1 is passed
  const params = new URLSearchParams(window.location.search);
  if (params.get("demo") === "1" && document.getElementById("loginForm")) {
    const cfg = window.KOWOPAY_CONFIG;
    document.getElementById("email").value = cfg.demoUserEmail;
    document.getElementById("password").value = cfg.demoUserPassword;
    showAlert("Demo credentials loaded! Click 'Log In to Wallet' or 'One-Click Demo User Login'.", "success");
  }

  // Handle Signup
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const fullName = document.getElementById("fullName").value.trim();
      const email = document.getElementById("email").value.trim().toLowerCase();
      const phone = document.getElementById("phone").value.trim();
      const password = document.getElementById("password").value;
      const pin = document.getElementById("pin").value.trim();

      if (!/^\d{4}$/.test(pin)) {
        showAlert("Transaction PIN must be exactly 4 digits.");
        return;
      }

      const users = window.KowoStore.getUsers();
      if (users.some(u => u.email.toLowerCase() === email)) {
        showAlert("An account with this email already exists. Please log in.");
        return;
      }

      const newUser = {
        id: "USR-" + Math.floor(1000 + Math.random() * 9000),
        fullName,
        email,
        phone,
        password,
        pin,
        accountNumber: window.KowoStore.generateAccountNumber(),
        bankName: "KowoPay Microfinance Bank",
        walletBalance: 5000.00, // Welcome bonus
        cashbackBalance: 100.00,
        kycTier: "Tier 1 (Basic)",
        status: "active",
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      window.KowoStore.saveUsers(users);

      // Record Welcome Bonus Transaction
      const txs = window.KowoStore.getTransactions();
      txs.unshift({
        id: "KP-TX-" + Math.floor(100000 + Math.random() * 900000),
        userId: newUser.id,
        userName: newUser.fullName,
        type: "credit",
        category: "Welcome Bonus",
        title: "KowoPay New Account Reward",
        counterparty: "KowoPay Treasury",
        amount: 5000.00,
        fee: 0,
        status: "completed",
        reference: "BON" + Date.now(),
        date: new Date().toISOString()
      });
      window.KowoStore.saveTransactions(txs);

      window.KowoStore.setCurrentUser(newUser.id);
      showAlert("Wallet created! Redirecting to your dashboard...", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 700);
    });
  }

  // Handle Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value.trim().toLowerCase();
      const password = document.getElementById("password").value;

      const settings = window.KowoStore.getSettings();
      if (settings.maintenanceMode) {
        showAlert("Platform is currently undergoing scheduled maintenance. Please check back shortly.");
        return;
      }

      const users = window.KowoStore.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email && u.password === password);

      if (!user) {
        showAlert("Invalid email address or password.");
        return;
      }

      if (user.status === "suspended") {
        showAlert("This account has been suspended by compliance. Contact support@kowopay.ng.");
        return;
      }

      window.KowoStore.setCurrentUser(user.id);
      showAlert("Login successful! Opening your KowoPay workspace...", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 600);
    });
  }

  // One-Click Demo Login
  const demoBtn = document.getElementById("demoLoginBtn");
  if (demoBtn) {
    demoBtn.addEventListener("click", function () {
      const users = window.KowoStore.getUsers();
      const demo = users.find(u => u.email === window.KOWOPAY_CONFIG.demoUserEmail) || users[0];
      if (demo) {
        window.KowoStore.setCurrentUser(demo.id);
        window.location.href = "dashboard.html";
      }
    });
  }
})();
