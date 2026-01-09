import { useQuery } from "@tanstack/react-query";
import * as accountsService from "../api/accountsService";
import * as categoriesService from "../api/categoriesService";
import * as tagsService from "../api/tagsService";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts", { activeOnly: true }],
    queryFn: () => accountsService.listAccounts(true),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories", { activeOnly: true }],
    queryFn: () => categoriesService.listCategories(true),
  });
}

export function useTags() {
  return useQuery({
    queryKey: ["tags", { activeOnly: true }],
    queryFn: () => tagsService.listTags(true),
  });
}
