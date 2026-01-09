import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as accountsService from "../api/accountsService";

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: accountsService.createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => accountsService.updateAccount(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}
