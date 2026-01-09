import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as txService from "../api/transactionsService";

export function useTransactionsPeriod(from, to) {
  return useQuery({
    queryKey: ["transactions", { from, to }],
    queryFn: () => txService.listMyTransactionsInPeriod(from, to),
    enabled: !!from && !!to,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: txService.createExpense,
    onSuccess: () => {
      // invalidamos todas las queries de transactions (por mes)
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useCreateIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: txService.createIncome,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
