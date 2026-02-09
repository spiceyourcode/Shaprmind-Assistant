import { apiClient } from "./client";
import type { Call, CallMessage } from "@/types";

export type CallListParams = {
  business_id: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
};

export async function listCalls(params: CallListParams): Promise<Call[]> {
  const response = await apiClient.get<Call[]>("/calls", { params });
  return response.data;
}

export async function getCall(callId: string): Promise<Call> {
  const response = await apiClient.get<Call>(`/calls/${callId}`);
  return response.data;
}

export async function getCallAudio(callId: string): Promise<{ url: string }> {
  const response = await apiClient.get<{ url: string }>(`/calls/${callId}/audio`);
  return response.data;
}

export type CreateCallMessagePayload = {
  sender: "customer" | "ai" | "human";
  content: string;
  sentiment?: number | null;
};

export async function addCallMessage(callId: string, payload: CreateCallMessagePayload): Promise<CallMessage> {
  const response = await apiClient.post<CallMessage>(`/calls/${callId}/messages`, payload);
  return response.data;
}
