const AUTH_KEY = "ai_company_auth";

export type AuthUser = {
  id: number;
  email: string;
  full_name: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export const getAuthSession = (): AuthSession | null => {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
};

export const setAuthSession = (session: AuthSession) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = () => Boolean(getAuthSession()?.token);
