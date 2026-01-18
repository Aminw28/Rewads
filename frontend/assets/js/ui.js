function setActiveNav(current) {
  document.querySelectorAll("[data-nav]").forEach(a => {
    if (a.getAttribute("data-nav") === current) a.classList.add("active");
  });
}

async function mountSidebar(current) {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  const u = await Auth.me();

  sidebar.innerHTML = `
    <div class="brand">
      <div class="logo">R</div>
      <div>
        <div class="title">Rewards</div>
        <div class="sub">Points MVP</div>
      </div>
    </div>

    <div class="userCard">
      <div class="userName">${escapeHtml(u?.name || u?.email || "User")}</div>
      <div class="userRole">Role: ${escapeHtml(u?.role || "user")}</div>
    </div>

    <nav class="nav" id="nav">
      <a href="./dashboard.html" data-nav="dashboard">Dashboard</a>
      <a href="./redeem.html" data-nav="redeem">Redeem</a>
      ${u?.role === "admin" ? `<a href="./admin.html" data-nav="admin">Admin</a>` : ``}
    </nav>

    <button class="btn btnDanger" id="logoutBtn">Logout</button>
  `;

  document.getElementById("logoutBtn").addEventListener("click", () => Auth.logout());
  setActiveNav(current);
}

function toast(el, msg, type="note"){
  el.className = "note " + (type === "error" ? "error" : type === "ok" ? "ok" : "");
  el.textContent = msg;
  el.style.display = "block";
}

function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

window.UI = { mountSidebar, toast, escapeHtml };
