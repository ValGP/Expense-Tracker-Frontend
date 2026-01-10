import { useQuery } from "@tanstack/react-query";
import { getSummary } from "../api/summaryService";

export function useSummary(from, to, top = 5) {
  return useQuery({
    queryKey: ["summary", from, to, top],
    queryFn: () => getSummary({ from, to, top }),
    enabled: !!from && !!to,
  });
}
