import { apiClient } from "./client";
import type { CustomerProfile } from "@/types";

export async function getCustomerProfile(
  callerNumber: string,
  businessId: string
): Promise<CustomerProfile> {
  const response = await apiClient.get<CustomerProfile>(`/customers/${encodeURIComponent(callerNumber)}`, {
    params: { business_id: businessId },
  });
  return response.data;
}

export type UpdateCustomerProfilePayload = {
  name?: string | null;
  preferences?: Record<string, unknown> | null;
  history?: Record<string, unknown> | null;
};

export async function updateCustomerProfile(
  profileId: string,
  payload: UpdateCustomerProfilePayload
): Promise<CustomerProfile> {
  const response = await apiClient.put<CustomerProfile>(`/customers/${profileId}`, payload);
  return response.data;
}
