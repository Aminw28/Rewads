const Auth = {
  token() { return localStorage.getItem("token"); },
  setToken(t){ localStorage.setItem("token", t); },
  clear(){ localStorage.removeItem("token"); localStorage.removeItem("me_cache"); },

  async me(force=false){
    if (!this.token()) return null;

    if (!force) {
      const cached = localStorage.getItem("me_cache");
      if (cached) { try { return JSON.parse(cached); } catch {} }
    }

    const data = await API.apiFetch("/auth/me", { method: "GET" });
    const user = data?.user || data;
    localStorage.setItem("me_cache", JSON.stringify(user));
    return user;
  },

  async login(email, password){
    const data = await API.apiFetch("/auth/login", {
      method:"POST",
      body: JSON.stringify({ email, password })
    });
    if (data?.token) this.setToken(data.token);
    await this.me(true);
    return data;
  },

  async register(payload){
    const data = await API.apiFetch("/auth/register", {
      method:"POST",
      body: JSON.stringify(payload)
    });
    if (data?.token) this.setToken(data.token);
    await this.me(true);
    return data;
  },

  logout(){
    this.clear();
    location.href = "./login.html";
  }
};

async function requireAuth() {
  if (!Auth.token()) location.href = "./login.html";
  try { await Auth.me(); } catch { Auth.logout(); }
}

async function requireAdmin() {
  await requireAuth();
  const u = await Auth.me();
  if (u?.role !== "admin") location.href = "./dashboard.html";
}

window.Auth = Auth;
window.requireAuth = requireAuth;
window.requireAdmin = requireAdmin;
