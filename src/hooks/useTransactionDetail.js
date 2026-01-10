import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listMyTransactions,
  updateTransaction,
  cancelTransaction,
} from "../api/transactionsService";

export function useTransactionById(id) {
  return useQuery({
    queryKey: ["transactionById", id],
    queryFn: async () => {
      const all = await listMyTransactions();
      const tx = all.find((t) => String(t.id) === String(id));
      if (!tx) throw new Error("Transaction not found");
      return tx;
    },
    enabled: !!id,
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateTransaction(id, payload),
    onSuccess: () => {
      // refrescar listas y dashboard
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["transactionsPeriod"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      qc.invalidateQueries({ queryKey: ["transactionById"] });
    },
  });
}

export function useCancelTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => cancelTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["transactionsPeriod"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      qc.invalidateQueries({ queryKey: ["transactionById"] });
    },
  });
}
