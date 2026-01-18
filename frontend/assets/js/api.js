function getToken(){ return localStorage.getItem("token"); }

async function apiFetch(path, options = {}) {
  const base = window.APP_CONFIG.API_BASE_URL;
  const headers = Object.assign(
    { "Content-Type": "application/json" },
    options.headers || {}
  );

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(base + path, { ...options, headers });

  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

window.API = { apiFetch };
