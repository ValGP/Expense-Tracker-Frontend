import { http } from "./http";

export async function listTags(activeOnly = true) {
  const res = await http.get("/api/tags", { params: { activeOnly } });
  return res.data; // TagResponse[]
}
