// apps/web/src/lib/api/client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { getSession } from 'next-auth/react';

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor — attach JWT token
  client.interceptors.request.use(async (config) => {
    const session = await getSession();

    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    if (session?.user?.organizationId) {
      config.headers['X-Tenant-ID'] = session.user.organizationId;
    }

    return config;
  });

  // Response interceptor — handle errors
  client.interceptors.response.use(
    (response) => response.data,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Redirect to login
        window.location.href = '/login';
      }

      const message =
        (error.response?.data as any)?.message ||
        error.message ||
        'An error occurred';

      return Promise.reject(new Error(message));
    },
  );

  return client;
};

export const apiClient = createApiClient();