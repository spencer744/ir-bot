import { useCallback } from 'react';

interface UseAdminApiReturn {
  get: (url: string) => Promise<any>;
  post: (url: string, body?: any) => Promise<any>;
  put: (url: string, body?: any) => Promise<any>;
  del: (url: string) => Promise<any>;
}

function getToken(): string | null {
  return localStorage.getItem('admin_token');
}

function handleUnauthorized() {
  localStorage.removeItem('admin_token');
  window.location.href = '/admin/login';
}

async function request(url: string, options: RequestInit): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthorized');
  }

  return res.json();
}

export function useAdminApi(): UseAdminApiReturn {
  const get = useCallback((url: string) => {
    return request(url, { method: 'GET' });
  }, []);

  const post = useCallback((url: string, body?: any) => {
    return request(url, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }, []);

  const put = useCallback((url: string, body?: any) => {
    return request(url, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }, []);

  const del = useCallback((url: string) => {
    return request(url, { method: 'DELETE' });
  }, []);

  return { get, post, put, del };
}
