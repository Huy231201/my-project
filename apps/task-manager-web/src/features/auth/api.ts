const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function postAuth(path: "register" | "login", body: object) {
  const response = await fetch(`${API_URL}/auth/${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return {
    success: response.ok,
    status: response.status,
    data,
  };
}

export async function getMe() {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  return {
    success: response.ok,
    status: response.status,
    data,
  };
}
