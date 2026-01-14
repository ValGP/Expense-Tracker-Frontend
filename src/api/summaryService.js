import { http } from "./http";

export async function getSummary({ from, to, top = 10 }) {
  const res = await http.get("/api/summary", { params: { from, to, top } });
  return res.data; // SummaryResponse
}
