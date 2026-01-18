(async function(){
  const form = document.getElementById("form");
  const msg = document.getElementById("msg");
  const btn = document.getElementById("btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    UI.toast(msg, "Processing...");

    try {
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      await Auth.register({ name, email, password });
      location.href = "./dashboard.html";
    } catch (err) {
      UI.toast(msg, err.message || "Register failed", "error");
      btn.disabled = false;
    }
  });
})();
