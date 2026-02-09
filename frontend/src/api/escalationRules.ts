import { apiClient } from "./client";
import type { EscalationRule } from "@/types";

export type CreateEscalationRulePayload = {
  keywords: string[];
  priority: number;
  action: "notify_owner" | "notify_staff" | "takeover_prompt";
  notify_user_ids?: string[] | null;
};

export type UpdateEscalationRulePayload = Partial<CreateEscalationRulePayload>;

export async function listEscalationRules(businessId: string): Promise<EscalationRule[]> {
  const response = await apiClient.get<EscalationRule[]>(
    `/businesses/${businessId}/escalation-rules`
  );
  return response.data;
}

export async function createEscalationRule(
  businessId: string,
  payload: CreateEscalationRulePayload
): Promise<EscalationRule> {
  const response = await apiClient.post<EscalationRule>(
    `/businesses/${businessId}/escalation-rules`,
    payload
  );
  return response.data;
}

export async function updateEscalationRule(
  businessId: string,
  ruleId: string,
  payload: UpdateEscalationRulePayload
): Promise<EscalationRule> {
  const response = await apiClient.put<EscalationRule>(
    `/businesses/${businessId}/escalation-rules/${ruleId}`,
    payload
  );
  return response.data;
}

export async function deleteEscalationRule(businessId: string, ruleId: string): Promise<{ status: string }> {
  const response = await apiClient.delete<{ status: string }>(
    `/businesses/${businessId}/escalation-rules/${ruleId}`
  );
  return response.data;
}
