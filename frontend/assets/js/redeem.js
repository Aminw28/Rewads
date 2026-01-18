(async function(){
  await requireAuth();
  await UI.mountSidebar("redeem");

  const rewardsWrap = document.getElementById("rewardsWrap");
  const myWrap = document.getElementById("myWrap");
  const rewardSelect = document.getElementById("rewardId");
  const form = document.getElementById("redeemForm");
  const msg = document.getElementById("msg");
  const btn = document.getElementById("btn");

  let rewards = [];

  function renderRewardsList(items){
    if (!items?.length) {
      rewardsWrap.textContent = "No rewards available.";
      return;
    }
    const rows = items.map(r => `
      <tr>
        <td>${UI.escapeHtml(r.title || r.name || "Reward")}</td>
        <td>${UI.escapeHtml(String(r.costPoints ?? r.cost ?? r.pointsRequired ?? ""))}</td>
        <td>${UI.escapeHtml(r.type || "recharge")}</td>
      </tr>
    `).join("");

    rewardsWrap.innerHTML = `
      <table class="table">
        <thead><tr><th>Title</th><th>Cost</th><th>Type</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function renderSelect(items){
    rewardSelect.innerHTML = items.map(r => `
      <option value="${r._id}">${UI.escapeHtml((r.title||r.name||"Reward") + " - " + (r.costPoints ?? r.cost ?? r.pointsRequired ?? ""))}</option>
    `).join("");
  }

  function renderMyRequests(items){
    if (!items?.length) {
      myWrap.textContent = "No requests yet.";
      return;
    }
    const rows = items.map(x => `
      <tr>
        <td>${UI.escapeHtml(x.rewardTitle || x.reward?.title || x.reward?.name || x.rewardId || "")}</td>
        <td>${UI.escapeHtml(x.phone || "")}</td>
        <td>${UI.escapeHtml(x.status || "pending")}</td>
        <td>${UI.escapeHtml(new Date(x.createdAt || Date.now()).toLocaleString())}</td>
      </tr>
    `).join("");

    myWrap.innerHTML = `
      <table class="table">
        <thead><tr><th>Reward</th><th>Phone</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  async function loadRewards(){
    const data = await API.apiFetch("/rewards", { method:"GET" });
    rewards = data?.rewards || data || [];
    renderRewardsList(rewards);
    renderSelect(rewards);
  }

  async function loadMy(){
    // ✅ حسب backend ديالك: قلت "My requests" => خديت /redeem/my
    const data = await API.apiFetch("/redeem/my", { method:"GET" });
    const items = data?.requests || data || [];
    renderMyRequests(items);
  }

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    btn.disabled = true;
    UI.toast(msg, "Sending...");

    try{
      const rewardId = rewardSelect.value;
      const phone = document.getElementById("phone").value.trim();

      await API.apiFetch("/redeem/request", {
        method:"POST",
        body: JSON.stringify({ rewardId, phone })
      });

      UI.toast(msg, "✅ Request created (pending).", "ok");
      document.getElementById("phone").value = "";
      await loadMy();
    }catch(err){
      UI.toast(msg, err.message || "Request failed", "error");
    }finally{
      btn.disabled = false;
    }
  });

  await loadRewards();
  await loadMy();
})();
