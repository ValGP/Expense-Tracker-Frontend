import { http } from "./http";

export async function listAccounts(activeOnly = true) {
  const res = await http.get("/api/accounts", { params: { activeOnly } });
  return res.data; // AccountSummaryResponse[]
}

export async function createAccount(payload) {
  // { name, type, currencyCode, initialBalance }
  const res = await http.post("/api/accounts", payload);
  return res.data; // AccountResponse
}

export async function updateAccount(id, payload) {
  // payload: { name?, type?, currencyCode?, active? }
  const res = await http.patch(`/api/accounts/${id}`, payload);
  return res.data; // AccountResponse
}
