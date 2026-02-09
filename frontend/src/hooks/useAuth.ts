import { useCallback, useState } from "react";
import { login, register, type RegisterRequest } from "@/api/auth";
import { getMe } from "@/api/users";
import { getApiErrorMessage } from "@/api/client";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authStore = useAuthStore();

  const handleLogin = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await login({ email, password });
      authStore.login(token.access_token, {
        id: "self",
        email,
        role: "owner",
        business_id: "",
      });
      const me = await getMe();
      authStore.setUser(me);
    } catch (err) {
      setError(getApiErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authStore]);

  const handleRegister = useCallback(async (payload: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const token = await register(payload);
      authStore.login(token.access_token, {
        id: "self",
        email: payload.email,
        role: payload.role,
        business_id: payload.business_id ?? "",
      });
      const me = await getMe();
      authStore.setUser(me);
    } catch (err) {
      setError(getApiErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authStore]);

  return {
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
  };
}
