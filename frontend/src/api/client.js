const API_BASE = "http://localhost:8000";

let accessToken = localStorage.getItem("accessToken") || null;
const refreshToken = localStorage.getItem("refreshToken") || null;

export function setTokens(access, refresh) {
  accessToken = access;
  if (access) localStorage.setItem("accessToken", access);
  else localStorage.removeItem("accessToken");

  if (refresh !== undefined) {
    if (refresh) localStorage.setItem("refreshToken", refresh);
    else localStorage.removeItem("refreshToken");
  }
}

export function clearTokens() {
  setTokens(null, null);
}

// Interceptor-like fetch
async function fetchWithAuth(path, options = {}) {
  let url = `${API_BASE}${path}`;
  let reqOptions = { ...options };

  if (!reqOptions.headers) reqOptions.headers = {};
  
  if (accessToken) {
    reqOptions.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, reqOptions);
  
  // Basic refresh mechanism
  if (res.status === 401 && accessToken) {
    const curRefresh = localStorage.getItem("refreshToken");
    if (curRefresh) {
      try {
        const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: curRefresh })
        });
        
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setTokens(data.access_token);
          // Retry original request
          reqOptions.headers["Authorization"] = `Bearer ${data.access_token}`;
          res = await fetch(url, reqOptions);
        } else {
          clearTokens();
          window.dispatchEvent(new Event("auth-expired"));
        }
      } catch (e) {
        clearTokens();
        window.dispatchEvent(new Event("auth-expired"));
      }
    } else {
      clearTokens();
      window.dispatchEvent(new Event("auth-expired"));
    }
  }

  if (!res.ok) {
    let err = `API error: ${res.status}`;
    try {
      const eData = await res.json();
      if (eData.detail) err = eData.detail;
    } catch {}
    throw new Error(err);
  }
  
  return res.json();
}

export async function loginApi(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    let err = "Login failed";
    try { const d = await res.json(); err = d.detail || err; } catch {}
    throw new Error(err);
  }
  return res.json();
}

export async function registerApi(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    let err = "Register failed";
    try { const d = await res.json(); err = d.detail || err; } catch {}
    throw new Error(err);
  }
  return res.json();
}

export async function getMe() {
  return fetchWithAuth("/api/auth/me");
}

export async function adminGetUsers() {
  return fetchWithAuth("/api/admin/users");
}

export async function adminUpdateUserRole(userId, role) {
  return fetchWithAuth(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role })
  });
}

export async function adminCreateUser(user) {
  return fetchWithAuth("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  });
}

export async function adminUpdateUser(userId, user) {
  return fetchWithAuth(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  });
}

export async function adminDeleteUser(userId) {
  return fetchWithAuth(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE"
  });
}

// Existing routes
export async function getMovies() {
  return fetchWithAuth("/api/movies");
}

export async function getCinemas(movieId, date) {
  let url = `/api/cinemas?movieId=${encodeURIComponent(movieId)}`;
  if (date) url += `&date=${encodeURIComponent(date)}`;
  return fetchWithAuth(url);
}

export async function getDates(movieId, cinemaId) {
  let url = `/api/dates?movieId=${encodeURIComponent(movieId)}`;
  if (cinemaId) url += `&cinemaId=${encodeURIComponent(cinemaId)}`;
  return fetchWithAuth(url);
}

export async function getShowtimes(movieId, date, cinemaId) {
  let url = `/api/showtimes?movieId=${encodeURIComponent(movieId)}&date=${encodeURIComponent(date)}`;
  if (cinemaId) url += `&cinemaId=${encodeURIComponent(cinemaId)}`;
  return fetchWithAuth(url);
}

export async function getSeats(showtimeId) {
  return fetchWithAuth(`/api/seats?showtimeId=${encodeURIComponent(showtimeId)}`);
}
