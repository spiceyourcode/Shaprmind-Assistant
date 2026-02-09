import { apiClient } from "./client";
import type { User } from "@/types";

export async function getMe(): Promise<User> {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
}

export async function listUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>("/users");
  return response.data;
}

export type CreateUserPayload = {
  email: string;
  password: string;
  role: "owner" | "staff";
  phone?: string | null;
};

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const response = await apiClient.post<User>("/users", payload);
  return response.data;
}

export type UpdateUserPayload = {
  role?: "owner" | "staff";
  phone?: string | null;
  push_token?: string | null;
};

export async function updateUser(userId: string, payload: UpdateUserPayload): Promise<User> {
  const response = await apiClient.put<User>(`/users/${userId}`, payload);
  return response.data;
}

export async function deleteUser(userId: string): Promise<{ status: string }> {
  const response = await apiClient.delete<{ status: string }>(`/users/${userId}`);
  return response.data;
}
