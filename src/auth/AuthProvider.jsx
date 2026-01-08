import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  clearAuth,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "./authStorage";
import { http } from "../api/http";
import * as authService from "../api/authService";
import * as meService from "../api/meService";

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken());
  const [user, setUserState] = useState(getStoredUser());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const reqId = http.interceptors.request.use((config) => {
      const t = getToken();
      if (t) config.headers.Authorization = `Bearer ${t}`;
      return config;
    });
    return () => http.interceptors.request.eject(reqId);
  }, []);

  useEffect(() => {
    const resId = http.interceptors.response.use(
      (r) => r,
      (err) => {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          clearAuth();
          window.location.assign("/login");
        }

        return Promise.reject(err);
      }
    );
    return () => http.interceptors.response.eject(resId);
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        const t = getToken();
        if (!t) return;
        const me = await meService.getMe();
        setUserState(me);
        setStoredUser(me);
        setTokenState(t);
      } catch {
        clearAuth();
        setUserState(null);
        setTokenState(null);
      } finally {
        setIsBootstrapping(false);
      }
    }
    bootstrap();
  }, []);

  async function doLogin(email, password) {
    const data = await authService.login(email, password);
    setToken(data.token);
    setStoredUser(data.user);
    setTokenState(data.token);
    setUserState(data.user);
    return data.user;
  }

  async function doRegister(name, email, password) {
    const data = await authService.register(name, email, password);
    setToken(data.token);
    setStoredUser(data.user);
    setTokenState(data.token);
    setUserState(data.user);
    return data.user;
  }

  function logout() {
    clearAuth();
    setTokenState(null);
    setUserState(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      isBootstrapping,
      login: doLogin,
      register: doRegister,
      logout,
    }),
    [token, user, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
