import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/stores/authStore";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export const apiClient = axios.create({
  baseURL,
  timeout: 20000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: string } | undefined;
    return data?.detail || error.message || "Request failed";
  }
  return "Request failed";
}
