import { useState, useEffect, useCallback } from 'react';

interface AdminAuth {
  isAuthenticated: boolean;
  email: string | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

function decodeTokenPayload(token: string): { email?: string; exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenExpired(payload: { exp?: number }): boolean {
  if (!payload.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

export function useAdminAuth(): AdminAuth {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      const payload = decodeTokenPayload(storedToken);
      if (payload && !isTokenExpired(payload)) {
        setToken(storedToken);
        setEmail(payload.email || null);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('admin_token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/dealroom/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      const newToken = data.token;
      localStorage.setItem('admin_token', newToken);
      const payload = decodeTokenPayload(newToken);
      setToken(newToken);
      setEmail(payload?.email || email);
      setIsAuthenticated(true);

      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setEmail(null);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, email, token, loading, login, logout };
}
