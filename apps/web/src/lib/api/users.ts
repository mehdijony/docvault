import apiClient from "./client";
import type { ApiResponse, User, UserProfile, UserRole } from "../../types";
import { isDemoMode } from "../utils";
import { MOCK_USERS } from "../mock-data";

export const usersApi = {
  list: async (): Promise<User[]> => {
    if (isDemoMode()) return MOCK_USERS;
    const { data } = await apiClient.get<ApiResponse<User[]>>("/users");
    return data.data;
  },

  getMe: async (): Promise<UserProfile> => {
    if (isDemoMode()) {
      return {
        ...MOCK_USERS[0],
        organization: { id: "550e8400-e29b-41d4-a716-446655440000", name: "Acme Corporation", plan: "pro" },
        preferences: { theme: "light", notifications: true },
      };
    }
    const { data } = await apiClient.get<ApiResponse<UserProfile>>("/users/me");
    return data.data;
  },

  getById: async (id: string): Promise<User> => {
    if (isDemoMode()) return MOCK_USERS.find((u: User) => u.id === id) || MOCK_USERS[0];
    const { data } = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return data.data;
  },

  updateRole: async (id: string, role: UserRole): Promise<User> => {
    if (isDemoMode()) {
      const user = MOCK_USERS.find((u: User) => u.id === id);
      return { ...(user || MOCK_USERS[0]), role, updatedAt: new Date().toISOString() };
    }
    const { data } = await apiClient.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
    return data.data;
  },
};
