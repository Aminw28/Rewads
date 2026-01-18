(async function(){
  // إلا كان logged in مشي مباشرة
  if (Auth.token()) {
    try { await Auth.me(); location.href="./dashboard.html"; } catch {}
  }

  const form = document.getElementById("form");
  const msg = document.getElementById("msg");
  const btn = document.getElementById("btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    UI.toast(msg, "Processing...");

    try {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      await Auth.login(email, password);
      location.href = "./dashboard.html";
    } catch (err) {
      UI.toast(msg, err.message || "Login failed", "error");
      btn.disabled = false;
    }
  });
})();
