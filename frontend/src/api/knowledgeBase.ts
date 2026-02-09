import { apiClient } from "./client";
import type { KnowledgeCategory } from "@/types";

export async function listKnowledge(businessId: string): Promise<KnowledgeCategory[]> {
  const response = await apiClient.get<KnowledgeCategory[]>(`/businesses/${businessId}/knowledge`);
  return response.data;
}
