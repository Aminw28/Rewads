(async function(){
  await requireAuth();
  await UI.mountSidebar("dashboard");

  const balanceEl = document.getElementById("balance");
  const msg = document.getElementById("msg");
  const collectBtn = document.getElementById("collectBtn");
  const refreshBtn = document.getElementById("refreshBtn");

  async function loadBalance(){
    const data = await API.apiFetch("/points/balance", { method:"GET" });
    const b = data?.balance ?? data?.points ?? 0;
    balanceEl.textContent = b;
  }

  async function collectTest(){
    collectBtn.disabled = true;
    UI.toast(msg, "Collecting (test) ...");

    try{
      const s = await API.apiFetch("/ads/session", { method:"POST" });
      const sessionId = s?.sessionId;
      await API.apiFetch("/ads/complete", {
        method:"POST",
        body: JSON.stringify({ sessionId })
      });
      await loadBalance();
      UI.toast(msg, "✅ Points added (test flow).", "ok");
    }catch(err){
      UI.toast(msg, err.message || "Collect failed", "error");
    }finally{
      collectBtn.disabled = false;
    }
  }

  collectBtn.addEventListener("click", collectTest);
  refreshBtn.addEventListener("click", async ()=>{
    try{ await loadBalance(); UI.toast(msg, "Updated.", "ok"); }catch(e){ UI.toast(msg, e.message, "error"); }
  });

  await loadBalance();
})();
