(async function(){
  await requireAdmin();
  await UI.mountSidebar("admin");

  const wrap = document.getElementById("wrap");
  const msg = document.getElementById("msg");
  const refreshBtn = document.getElementById("refreshBtn");

  function render(items){
    if (!items?.length) {
      wrap.textContent = "No pending requests.";
      return;
    }

    const rows = items.map(x => `
      <tr>
        <td>${UI.escapeHtml(x._id)}</td>
        <td>${UI.escapeHtml(x.userEmail || x.user?.email || "")}</td>
        <td>${UI.escapeHtml(x.rewardTitle || x.reward?.title || x.reward?.name || "")}</td>
        <td>${UI.escapeHtml(x.phone || "")}</td>
        <td>${UI.escapeHtml(x.status || "pending")}</td>
        <td class="actions">
          <button class="btn btnOk" data-approve="${x._id}">Approve</button>
          <button class="btn btnDanger" data-reject="${x._id}">Reject</button>
        </td>
      </tr>
    `).join("");

    wrap.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>ID</th><th>User</th><th>Reward</th><th>Phone</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    wrap.querySelectorAll("[data-approve]").forEach(b=>{
      b.addEventListener("click", ()=>act("approve", b.getAttribute("data-approve")));
    });
    wrap.querySelectorAll("[data-reject]").forEach(b=>{
      b.addEventListener("click", ()=>act("reject", b.getAttribute("data-reject")));
    });
  }

  async function load(){
    const data = await API.apiFetch("/admin/redeem?status=pending", { method:"GET" });
    const items = data?.requests || data || [];
    render(items);
  }

  async function act(type, id){
    UI.toast(msg, "Processing...");
    try{
      if (type === "approve") {
        await API.apiFetch(`/admin/redeem/${id}/approve`, { method:"POST" });
        UI.toast(msg, "✅ Approved", "ok");
      } else {
        await API.apiFetch(`/admin/redeem/${id}/reject`, { method:"POST" });
        UI.toast(msg, "✅ Rejected", "ok");
      }
      await load();
    }catch(err){
      UI.toast(msg, err.message || "Action failed", "error");
    }
  }

  refreshBtn.addEventListener("click", async ()=>{
    try{ await load(); UI.toast(msg, "Updated.", "ok"); }catch(e){ UI.toast(msg, e.message, "error"); }
  });

  await load();
})();
