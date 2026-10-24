import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, tokenStore } from './api';

interface AuthCtx {
  authed: boolean;
  checking: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthCtx>({
  authed: false,
  checking: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!tokenStore.get()) {
      setChecking(false);
      return;
    }
    api
      .session()
      .then(() => setAuthed(true))
      .catch(() => {
        tokenStore.clear();
        setAuthed(false);
      })
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (password: string) => {
    const { token } = await api.login(password);
    tokenStore.set(token);
    setAuthed(true);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setAuthed(false);
  }, []);

  const value = useMemo(() => ({ authed, checking, login, logout }), [authed, checking, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
