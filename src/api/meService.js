import { http } from "./http";

export async function getMe() {
  const res = await http.get("/api/me");
  return res.data; // UserSummary
}
