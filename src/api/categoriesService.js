import { http } from "./http";

export async function listCategories(activeOnly = true) {
  const res = await http.get("/api/categories", { params: { activeOnly } });
  return res.data; // CategoryResponse[]
}

export async function createCategory(payload) {
  // { name, description, colorHex }
  const res = await http.post("/api/categories", payload);
  return res.data; // CategoryResponse
}

export async function updateCategory(id, payload) {
  // payload: { name?, description?, colorHex?, active? }
  const res = await http.patch(`/api/categories/${id}`, payload);
  return res.data; // CategoryResponse
}
