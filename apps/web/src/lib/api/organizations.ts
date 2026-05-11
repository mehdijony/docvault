import apiClient from "./client";
import type { ApiResponse, Organization, UpdateOrganizationDto } from "../../types";
import { isDemoMode } from "../utils";
import { MOCK_ORGANIZATION } from "../mock-data";

export const organizationsApi = {
  getMine: async (): Promise<Organization> => {
    if (isDemoMode()) return MOCK_ORGANIZATION;
    const { data } = await apiClient.get<ApiResponse<Organization>>("/organizations/me");
    return data.data;
  },

  updateMine: async (dto: UpdateOrganizationDto): Promise<Organization> => {
    if (isDemoMode()) return { ...MOCK_ORGANIZATION, ...dto, updatedAt: new Date().toISOString() };
    const { data } = await apiClient.patch<ApiResponse<Organization>>("/organizations/me", dto);
    return data.data;
  },
};
