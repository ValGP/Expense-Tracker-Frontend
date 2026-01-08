import { http } from "./http";

export async function login(email, password) {
  const res = await http.post("/auth/login", { email, password });
  return res.data; // { token, user }
}

export async function register(name, email, password) {
  const res = await http.post("/auth/register", { name, email, password });
  return res.data; // { token, user }
}
