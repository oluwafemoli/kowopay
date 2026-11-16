/**
 * KowoPay Owner / Admin Portal Controller
 */
(function checkAdminAuth() {
  const key = window.KOWOPAY_CONFIG.storageKeys.ADMIN_SESSION;
  if (localStorage.getItem(key) !== "true") {
    window.location.href = "login.html";
  }
})();

function showAdminAlert(msg, type = "success") {
  const el = document.getElementById("adminAlert");
  el.textContent = msg;
  el.className = "alert show " + (type === "success" ? "alert-success" : "alert-error");
  setTimeout(() => el.classList.remove("show"), 4000);
}

document.querySelectorAll(".sidebar-link[data-admin-tab]").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-admin-tab");
    document.querySelectorAll(".admin-tab").forEach(t => t.style.display = "none");
    document.querySelectorAll(".sidebar-link[data-admin-tab]").forEach(b => b.classList.remove("active"));
    document.getElementById("admin-tab-" + tab).style.display = "block";
    btn.classList.add("active");
  });
});

document.getElementById("adminLogoutBtn").addEventListener("click", () => {
  localStorage.removeItem(window.KOWOPAY_CONFIG.storageKeys.ADMIN_SESSION);
  window.location.href = "login.html";
});

function renderAdminPortal() {
  const users = window.KowoStore.getUsers();
  const txs = window.KowoStore.getTransactions();
  const settings = window.KowoStore.getSettings();

  const totalLiquidity = users.reduce((s, u) => s + Number(u.walletBalance || 0), 0);
  const totalVolume = txs.reduce((s, t) => s + Number(t.amount || 0), 0);
  const pendingTxs = txs.filter(t => t.status === "pending");

  document.getElementById("adminTotalLiquidity").textContent = window.KowoStore.formatMoney(totalLiquidity);
  document.getElementById("adminTotalUsers").textContent = users.length;
  document.getElementById("adminTxVolume").textContent = window.KowoStore.formatMoney(totalVolume);
  document.getElementById("adminPendingCount").textContent = pendingTxs.length;

  // Pending Approvals
  document.getElementById("adminPendingTxBody").innerHTML = pendingTxs.map(tx => `
    <tr>
      <td><code>${tx.reference}</code></td>
      <td>${tx.userName || tx.userId}</td>
      <td>${tx.title}<br><small style="color:var(--text-secondary)">${tx.counterparty}</small></td>
      <td><strong>${window.KowoStore.formatMoney(tx.amount)}</strong></td>
      <td><span class="status-badge status-pending">${tx.status}</span></td>
      <td style="display:flex;gap:6px;">
        <button class="btn btn-primary btn-sm" onclick="decideTransaction('${tx.id}', 'completed')">Approve</button>
        <button class="btn btn-danger btn-sm" onclick="decideTransaction('${tx.id}', 'rejected')">Reject & Refund</button>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);">No pending compliance approvals.</td></tr>`;

  // Users Table
  document.getElementById("adminUsersBody").innerHTML = users.map(u => `
    <tr>
      <td><code>${u.id}</code></td>
      <td><strong>${u.fullName}</strong><br><small style="color:var(--text-secondary)">${u.email}</small></td>
      <td>${u.accountNumber}</td>
      <td><strong>${window.KowoStore.formatMoney(u.walletBalance)}</strong></td>
      <td>${u.kycTier}</td>
      <td><span class="status-badge status-${u.status}">${u.status}</span></td>
      <td style="display:flex;gap:6px;flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm" onclick="adminCreditUser('${u.id}')">+ Credit ₦10k</button>
        <button class="btn btn-sm ${u.status === 'active' ? 'btn-danger' : 'btn-primary'}" onclick="toggleUserStatus('${u.id}')">
          ${u.status === 'active' ? 'Suspend' : 'Activate'}
        </button>
      </td>
    </tr>
  `).join("");

  // All Transactions Table
  document.getElementById("adminAllTxBody").innerHTML = txs.map(tx => `
    <tr>
      <td>${new Date(tx.date).toLocaleDateString()}</td>
      <td><code>${tx.reference}</code></td>
      <td>${tx.userName || tx.userId}</td>
      <td>${tx.title}</td>
      <td><strong>${window.KowoStore.formatMoney(tx.amount)}</strong></td>
      <td><span class="status-badge status-${tx.status}">${tx.status}</span></td>
      <td>
        ${tx.status === 'pending'
          ? `<button class="btn btn-primary btn-sm" onclick="decideTransaction('${tx.id}', 'completed')">Approve</button>`
          : '—'}
      </td>
    </tr>
  `).join("");

  // Settings Form Populate
  document.getElementById("setTransferFee").value = settings.transferFeeFlat ?? 10;
  document.getElementById("setCardFee").value = settings.virtualCardCreationFee ?? 1500;
  document.getElementById("setCashback").value = settings.airtimeCashbackPercent ?? 2;
  document.getElementById("setAnnouncement").value = settings.announcement || "";
  document.getElementById("setMaintenance").value = String(Boolean(settings.maintenanceMode));
}

function decideTransaction(txId, decision) {
  const txs = window.KowoStore.getTransactions();
  const idx = txs.findIndex(t => t.id === txId);
  if (idx === -1) return;

  txs[idx].status = decision;
  window.KowoStore.saveTransactions(txs);

  // If rejected, refund the user's wallet
  if (decision === "rejected") {
    const users = window.KowoStore.getUsers();
    const uIdx = users.findIndex(u => u.id === txs[idx].userId);
    if (uIdx !== -1) {
      users[uIdx].walletBalance += Number(txs[idx].amount) + Number(txs[idx].fee || 0);
      window.KowoStore.saveUsers(users);
    }
  }

  renderAdminPortal();
  showAdminAlert(`Transaction ${txs[idx].reference} marked as ${decision.toUpperCase()}.`);
}

function adminCreditUser(userId) {
  const users = window.KowoStore.getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return;
  users[idx].walletBalance += 10000;
  window.KowoStore.saveUsers(users);

  const txs = window.KowoStore.getTransactions();
  txs.unshift({
    id: "KP-TX-" + Math.floor(100000 + Math.random() * 900000),
    userId: users[idx].id,
    userName: users[idx].fullName,
    type: "credit",
    category: "Admin Settlement",
    title: "Owner Admin Treasury Credit",
    counterparty: "KowoPay Admin Console",
    amount: 10000,
    fee: 0,
    status: "completed",
    reference: "ADM" + Date.now(),
    date: new Date().toISOString()
  });
  window.KowoStore.saveTransactions(txs);

  renderAdminPortal();
  showAdminAlert(`Credited ₦10,000.00 to ${users[idx].fullName}.`);
}

function toggleUserStatus(userId) {
  const users = window.KowoStore.getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return;
  users[idx].status = users[idx].status === "active" ? "suspended" : "active";
  window.KowoStore.saveUsers(users);
  renderAdminPortal();
  showAdminAlert(`Updated ${users[idx].fullName} status to ${users[idx].status.toUpperCase()}.`);
}

document.getElementById("adminSettingsForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const updated = {
    transferFeeFlat: Number(document.getElementById("setTransferFee").value),
    virtualCardCreationFee: Number(document.getElementById("setCardFee").value),
    airtimeCashbackPercent: Number(document.getElementById("setCashback").value),
    announcement: document.getElementById("setAnnouncement").value.trim(),
    maintenanceMode: document.getElementById("setMaintenance").value === "true"
  };
  window.KowoStore.saveSettings(updated);
  showAdminAlert("Platform configuration saved and applied live!");
});

renderAdminPortal();
