/**
 * KowoPay User Dashboard Controller
 */
let currentUser = window.KowoStore.getCurrentUser();
if (!currentUser) {
  window.location.href = "login.html";
}

function showDashAlert(msg, type = "success") {
  const el = document.getElementById("dashAlert");
  el.textContent = msg;
  el.className = "alert show " + (type === "success" ? "alert-success" : "alert-error");
  setTimeout(() => el.classList.remove("show"), 4500);
}

function openModal(id) {
  document.getElementById(id).classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-view").forEach(v => v.style.display = "none");
  document.querySelectorAll(".sidebar-link[data-tab]").forEach(b => b.classList.remove("active"));
  const target = document.getElementById("tab-" + tabName);
  if (target) target.style.display = "block";
  const btn = document.querySelector(`.sidebar-link[data-tab="${tabName}"]`);
  if (btn) btn.classList.add("active");
}

document.querySelectorAll(".sidebar-link[data-tab]").forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.getAttribute("data-tab")));
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  window.KowoStore.logoutUser();
  window.location.href = "login.html";
});

document.getElementById("txDestinationType").addEventListener("change", function () {
  document.getElementById("bankSelectGroup").style.display = this.value === "bank" ? "block" : "none";
});

function refreshUserRecord() {
  currentUser = window.KowoStore.getCurrentUser();
  if (!currentUser) {
    window.location.href = "login.html";
  }
}

function renderDashboard() {
  refreshUserRecord();
  document.getElementById("welcomeHeading").textContent = "Welcome, " + currentUser.fullName;
  document.getElementById("accountSubline").textContent =
    `${currentUser.bankName} • NUBAN: ${currentUser.accountNumber}`;
  document.getElementById("kycBadge").textContent = currentUser.kycTier;
  document.getElementById("walletBalanceVal").textContent = window.KowoStore.formatMoney(currentUser.walletBalance);
  document.getElementById("nubanCopyLine").textContent = "Account Number: " + currentUser.accountNumber;
  document.getElementById("cashbackBalanceVal").textContent = window.KowoStore.formatMoney(currentUser.cashbackBalance || 0);

  const allTxs = window.KowoStore.getTransactions().filter(t => t.userId === currentUser.id);
  const totalDebit = allTxs
    .filter(t => t.type === "debit" && t.status !== "rejected")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  document.getElementById("totalSpendVal").textContent = window.KowoStore.formatMoney(totalDebit);

  // Recent 5 transactions
  const recentBody = document.getElementById("recentTxBody");
  recentBody.innerHTML = allTxs.slice(0, 5).map(tx => `
    <tr>
      <td><code>${tx.reference}</code></td>
      <td><strong>${tx.title}</strong><br><small style="color:var(--text-secondary)">${tx.counterparty}</small></td>
      <td>${tx.category}</td>
      <td style="color:${tx.type === 'credit' ? '#34D399' : '#F8FAFC'};font-weight:700;">
        ${tx.type === 'credit' ? '+' : '-'}${window.KowoStore.formatMoney(tx.amount)}
      </td>
      <td><span class="status-badge status-${tx.status}">${tx.status}</span></td>
      <td><button class="btn btn-outline btn-sm" onclick="viewReceipt('${tx.id}')">Receipt</button></td>
    </tr>
  `).join("") || `<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);">No transactions yet.</td></tr>`;

  // Full history with search filter
  const q = (document.getElementById("txSearchInput")?.value || "").toLowerCase();
  const filteredTxs = allTxs.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.reference.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q)
  );
  document.getElementById("fullTxBody").innerHTML = filteredTxs.map(tx => `
    <tr>
      <td>${new Date(tx.date).toLocaleDateString()}</td>
      <td><code>${tx.reference}</code></td>
      <td><strong>${tx.title}</strong><br><small style="color:var(--text-secondary)">${tx.counterparty}</small></td>
      <td>${tx.category}</td>
      <td style="color:${tx.type === 'credit' ? '#34D399' : '#F8FAFC'};font-weight:700;">
        ${tx.type === 'credit' ? '+' : '-'}${window.KowoStore.formatMoney(tx.amount)}
      </td>
      <td><span class="status-badge status-${tx.status}">${tx.status}</span></td>
      <td><button class="btn btn-outline btn-sm" onclick="viewReceipt('${tx.id}')">View</button></td>
    </tr>
  `).join("");

  // Virtual Cards
  const cards = window.KowoStore.getCards().filter(c => c.userId === currentUser.id);
  document.getElementById("cardsContainer").innerHTML = cards.map(card => `
    <div class="feature-card" style="background:linear-gradient(135deg,#0052FF 0%,#06122E 100%);border-color:rgba(56,189,248,0.45);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
        <span style="font-weight:700;font-size:0.9rem;">${card.label}</span>
        <span class="status-badge ${card.frozen ? 'status-suspended' : 'status-active'}">${card.frozen ? 'Frozen' : 'Active'}</span>
      </div>
      <div style="font-size:1.3rem;letter-spacing:0.12em;font-weight:800;margin-bottom:14px;">
        ${card.showFull ? card.fullNumber : card.maskedNumber}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.82rem;color:#BAE6FD;margin-bottom:16px;">
        <span>HOLDER: ${card.cardHolder}</span>
        <span>EXP: ${card.expiry} | CVV: ${card.showFull ? card.cvv : '•••'}</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm" onclick="toggleCardReveal('${card.id}')">${card.showFull ? 'Hide Details' : 'Reveal PAN/CVV'}</button>
        <button class="btn btn-outline btn-sm" onclick="toggleCardFreeze('${card.id}')">${card.frozen ? 'Unfreeze Card' : 'Freeze Card'}</button>
      </div>
    </div>
  `).join("") || `<p style="color:var(--text-secondary);">No virtual cards issued yet. Click "+ Issue New Virtual Card" above.</p>`;

  // Profile summary
  document.getElementById("profileSummaryBox").innerHTML = `
    <div><strong>Full Name:</strong> ${currentUser.fullName}</div>
    <div><strong>Email:</strong> ${currentUser.email}</div>
    <div><strong>Phone:</strong> ${currentUser.phone}</div>
    <div><strong>NUBAN Account:</strong> ${currentUser.accountNumber} (${currentUser.bankName})</div>
    <div><strong>Verification Level:</strong> ${currentUser.kycTier}</div>
  `;
}

// Fund Wallet
document.getElementById("fundWalletForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const amount = Number(document.getElementById("fundAmount").value);
  const method = document.getElementById("fundMethod").value;
  if (amount < 500) return;

  const users = window.KowoStore.getUsers();
  const idx = users.findIndex(u => u.id === currentUser.id);
  users[idx].walletBalance += amount;
  window.KowoStore.saveUsers(users);

  const txs = window.KowoStore.getTransactions();
  txs.unshift({
    id: "KP-TX-" + Math.floor(100000 + Math.random() * 900000),
    userId: currentUser.id,
    userName: currentUser.fullName,
    type: "credit",
    category: "Wallet Funding",
    title: method,
    counterparty: "Self Top-up",
    amount,
    fee: 0,
    status: "completed",
    reference: "FND" + Date.now(),
    date: new Date().toISOString()
  });
  window.KowoStore.saveTransactions(txs);

  closeModal("fundModal");
  this.reset();
  renderDashboard();
  showDashAlert(`Wallet funded with ${window.KowoStore.formatMoney(amount)}!`);
});

// Send Money / Bank Transfer
document.getElementById("transferForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const destType = document.getElementById("txDestinationType").value;
  const bank = destType === "kowopay" ? "KowoPay MFB" : document.getElementById("recipientBank").value;
  const acct = document.getElementById("recipientAcct").value.trim();
  const name = document.getElementById("recipientName").value.trim();
  const amount = Number(document.getElementById("transferAmount").value);
  const pin = document.getElementById("transferPin").value.trim();
  const settings = window.KowoStore.getSettings();

  if (pin !== currentUser.pin) {
    showDashAlert("Incorrect 4-digit Security PIN.", "error");
    return;
  }

  const fee = destType === "kowopay" ? 0 : Number(settings.transferFeeFlat ?? 10);
  const totalDebit = amount + fee;

  if (totalDebit > currentUser.walletBalance) {
    showDashAlert("Insufficient wallet balance for this transfer.", "error");
    return;
  }

  // Flag transfers >= 250,000 for admin compliance review; settle smaller ones immediately
  const status = amount >= 250000 ? "pending" : "completed";

  const users = window.KowoStore.getUsers();
  const senderIdx = users.findIndex(u => u.id === currentUser.id);
  users[senderIdx].walletBalance -= totalDebit;

  // If recipient is also a KowoPay user, credit them immediately
  if (destType === "kowopay") {
    const recIdx = users.findIndex(u => u.accountNumber === acct);
    if (recIdx !== -1 && status === "completed") {
      users[recIdx].walletBalance += amount;
    }
  }
  window.KowoStore.saveUsers(users);

  const txs = window.KowoStore.getTransactions();
  txs.unshift({
    id: "KP-TX-" + Math.floor(100000 + Math.random() * 900000),
    userId: currentUser.id,
    userName: currentUser.fullName,
    type: "debit",
    category: destType === "kowopay" ? "P2P Transfer" : "Bank Transfer",
    title: `Transfer to ${name}`,
    counterparty: `${bank} — ${acct}`,
    amount,
    fee,
    status,
    reference: "TRF" + Date.now(),
    date: new Date().toISOString()
  });
  window.KowoStore.saveTransactions(txs);

  this.reset();
  renderDashboard();
  switchTab("overview");
  showDashAlert(
    status === "pending"
      ? `Transfer of ${window.KowoStore.formatMoney(amount)} queued for high-value compliance review.`
      : `Successfully transferred ${window.KowoStore.formatMoney(amount)} to ${name}!`
  );
});

// Pay Bills & Airtime
document.getElementById("billsForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const service = document.getElementById("billService").value;
  const provider = document.getElementById("billProvider").value;
  const target = document.getElementById("billTarget").value.trim();
  const amount = Number(document.getElementById("billAmount").value);
  const pin = document.getElementById("billPin").value.trim();
  const settings = window.KowoStore.getSettings();

  if (pin !== currentUser.pin) {
    showDashAlert("Incorrect 4-digit Security PIN.", "error");
    return;
  }
  if (amount > currentUser.walletBalance) {
    showDashAlert("Insufficient wallet balance.", "error");
    return;
  }

  const cashbackEarned = amount * ((Number(settings.airtimeCashbackPercent ?? 2)) / 100);
  const users = window.KowoStore.getUsers();
  const idx = users.findIndex(u => u.id === currentUser.id);
  users[idx].walletBalance -= amount;
  users[idx].cashbackBalance = (users[idx].cashbackBalance || 0) + cashbackEarned;
  window.KowoStore.saveUsers(users);

  const tokenNote = service.includes("Electricity")
    ? ` | Token: ${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}`
    : "";

  const txs = window.KowoStore.getTransactions();
  txs.unshift({
    id: "KP-TX-" + Math.floor(100000 + Math.random() * 900000),
    userId: currentUser.id,
    userName: currentUser.fullName,
    type: "debit",
    category: service,
    title: `${provider} — ${service}`,
    counterparty: target + tokenNote,
    amount,
    fee: 0,
    status: "completed",
    reference: "BIL" + Date.now(),
    date: new Date().toISOString()
  });
  window.KowoStore.saveTransactions(txs);

  this.reset();
  renderDashboard();
  switchTab("overview");
  showDashAlert(`${service} paid! You earned ${window.KowoStore.formatMoney(cashbackEarned)} cashback.`);
});

function redeemCashback() {
  refreshUserRecord();
  const cb = Number(currentUser.cashbackBalance || 0);
  if (cb <= 0) {
    showDashAlert("No cashback balance available to redeem.", "error");
    return;
  }
  const users = window.KowoStore.getUsers();
  const idx = users.findIndex(u => u.id === currentUser.id);
  users[idx].walletBalance += cb;
  users[idx].cashbackBalance = 0;
  window.KowoStore.saveUsers(users);
  renderDashboard();
  showDashAlert(`Redeemed ${window.KowoStore.formatMoney(cb)} into your main wallet!`);
}

function createNewVirtualCard() {
  refreshUserRecord();
  const fee = Number(window.KowoStore.getSettings().virtualCardCreationFee ?? 1500);
  if (currentUser.walletBalance < fee) {
    showDashAlert(`Insufficient balance. Card issuance requires ${window.KowoStore.formatMoney(fee)}.`, "error");
    return;
  }
  const users = window.KowoStore.getUsers();
  const idx = users.findIndex(u => u.id === currentUser.id);
  users[idx].walletBalance -= fee;
  window.KowoStore.saveUsers(users);

  const last4 = Math.floor(1000 + Math.random() * 9000);
  const cards = window.KowoStore.getCards();
  cards.push({
    id: "CRD-" + Math.floor(100 + Math.random() * 900),
    userId: currentUser.id,
    label: "KowoPay Virtual Mastercard",
    cardHolder: currentUser.fullName.toUpperCase(),
    maskedNumber: `5399 •••• •••• ${last4}`,
    fullNumber: `5399 ${Math.floor(1000+Math.random()*9000)} ${Math.floor(1000+Math.random()*9000)} ${last4}`,
    expiry: "11/30",
    cvv: String(Math.floor(100 + Math.random() * 900)),
    brand: "Mastercard",
    balance: 0,
    frozen: false,
    showFull: false
  });
  window.KowoStore.saveCards(cards);
  renderDashboard();
  showDashAlert("New Virtual Mastercard issued!");
}

function toggleCardReveal(cardId) {
  const cards = window.KowoStore.getCards();
  const c = cards.find(x => x.id === cardId);
  if (c) c.showFull = !c.showFull;
  window.KowoStore.saveCards(cards);
  renderDashboard();
}

function toggleCardFreeze(cardId) {
  const cards = window.KowoStore.getCards();
  const c = cards.find(x => x.id === cardId);
  if (c) c.frozen = !c.frozen;
  window.KowoStore.saveCards(cards);
  renderDashboard();
}

function viewReceipt(txId) {
  const tx = window.KowoStore.getTransactions().find(t => t.id === txId);
  if (!tx) return;
  document.getElementById("receiptContent").innerHTML = `
    <div style="background:var(--bg-obsidian);padding:16px;border-radius:12px;border:1px solid var(--border-subtle);">
      <div style="font-size:1.4rem;font-weight:800;color:#38BDF8;margin-bottom:8px;">
        ${window.KowoStore.formatMoney(tx.amount)}
      </div>
      <div><strong>Status:</strong> ${tx.status.toUpperCase()}</div>
      <div><strong>Reference:</strong> ${tx.reference}</div>
      <div><strong>Title:</strong> ${tx.title}</div>
      <div><strong>Counterparty:</strong> ${tx.counterparty}</div>
      <div><strong>Category:</strong> ${tx.category}</div>
      <div><strong>Fee Charged:</strong> ${window.KowoStore.formatMoney(tx.fee || 0)}</div>
      <div><strong>Timestamp:</strong> ${new Date(tx.date).toLocaleString()}</div>
    </div>
  `;
  openModal("receiptModal");
}

function upgradeKycTier() {
  const users = window.KowoStore.getUsers();
  const idx = users.findIndex(u => u.id === currentUser.id);
  users[idx].kycTier = "Tier 3 (Verified)";
  window.KowoStore.saveUsers(users);
  renderDashboard();
  showDashAlert("KYC upgraded to Tier 3 (Verified)!");
}

document.getElementById("pinChangeForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const oldPin = document.getElementById("oldPin").value.trim();
  const newPin = document.getElementById("newPin").value.trim();
  if (oldPin !== currentUser.pin) {
    showDashAlert("Current PIN does not match.", "error");
    return;
  }
  const users = window.KowoStore.getUsers();
  const idx = users.findIndex(u => u.id === currentUser.id);
  users[idx].pin = newPin;
  window.KowoStore.saveUsers(users);
  this.reset();
  renderDashboard();
  showDashAlert("Transaction PIN updated successfully!");
});

renderDashboard();
