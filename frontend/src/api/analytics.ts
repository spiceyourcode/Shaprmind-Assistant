import { apiClient } from "./client";
import type { AnalyticsSummary } from "@/types";

export type AnalyticsSeries = {
  call_volume: { date: string; count: number }[];
  escalation_reasons: { reason: string; count: number }[];
  duration_by_day: { day: string; avg_duration: number }[];
};

export async function getAnalyticsSummary(
  businessId: string,
  period: string
): Promise<AnalyticsSummary> {
  const response = await apiClient.get<AnalyticsSummary>("/analytics/summary", {
    params: { business_id: businessId, period },
  });
  return response.data;
}

export async function getAnalyticsSeries(
  businessId: string,
  period: string
): Promise<AnalyticsSeries> {
  const response = await apiClient.get<AnalyticsSeries>("/analytics/series", {
    params: { business_id: businessId, period },
  });
  return response.data;
}
