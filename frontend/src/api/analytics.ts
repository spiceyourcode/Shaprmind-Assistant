import { apiClient } from "./client";
import type { AnalyticsSummary } from "@/types";

export async function getAnalyticsSummary(
  businessId: string,
  period: string
): Promise<AnalyticsSummary> {
  const response = await apiClient.get<AnalyticsSummary>("/analytics/summary", {
    params: { business_id: businessId, period },
  });
  return response.data;
}
