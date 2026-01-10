import { http } from "./http";

export async function listMyTransactions() {
  const res = await http.get("/api/transactions");
  return res.data;
}

export async function listMyTransactionsInPeriod(from, to) {
  const res = await http.get("/api/transactions/period", {
    params: { from, to },
  });
  return res.data;
}

export async function createExpense(payload) {
  // payload: { sourceAccountId, categoryId, amount, description, operationDate, tagIds }
  const res = await http.post("/api/transactions/expense", payload);
  return res.data;
}

export async function createIncome(payload) {
  // payload: { destinationAccountId, categoryId, amount, description, operationDate, tagIds }
  const res = await http.post("/api/transactions/income", payload);
  return res.data;
}

export async function updateTransaction(id, payload) {
  // payload: { description?, operationDate?, categoryId?, tagIds? }
  const res = await http.patch(`/api/transactions/${id}`, payload);
  return res.data; // TransactionResponse
}

export async function cancelTransaction(id) {
  const res = await http.patch(`/api/transactions/${id}/cancel`);
  return res.data; // TransactionResponse
}
