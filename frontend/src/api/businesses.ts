import { apiClient } from "./client";
import type { Business } from "@/types";

export type CreateBusinessPayload = {
  name: string;
  phone_number: string;
};

export async function createBusiness(payload: CreateBusinessPayload): Promise<Business> {
  const response = await apiClient.post<Business>("/businesses", payload);
  return response.data;
}

export async function getBusiness(businessId: string): Promise<Business> {
  const response = await apiClient.get<Business>(`/businesses/${businessId}`);
  return response.data;
}

export type UploadKnowledgePayload = {
  category: string;
  content: string;
};

export async function uploadKnowledge(businessId: string, payload: UploadKnowledgePayload): Promise<{ status: string }> {
  const response = await apiClient.put<{ status: string }>(
    `/businesses/${businessId}/knowledge`,
    payload
  );
  return response.data;
}
