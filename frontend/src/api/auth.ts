import { apiClient } from "./client";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  role: "owner" | "staff";
  business_id?: string | null;
  phone?: string | null;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export async function login(payload: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>("/auth/login", payload);
  return response.data;
}

export async function register(payload: RegisterRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>("/auth/register", payload);
  return response.data;
}
