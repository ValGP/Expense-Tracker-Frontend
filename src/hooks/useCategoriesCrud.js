import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as categoriesService from "../api/categoriesService";

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesService.createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) =>
      categoriesService.updateCategory(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
