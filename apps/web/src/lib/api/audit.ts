import apiClient from "./client";
import type { ApiResponse, PaginatedData, AuditLog, AuditListParams } from "../../types";
import { isDemoMode } from "../utils";
import { getMockAuditPaginated } from "../mock-data";

export const auditApi = {
  list: async (params?: AuditListParams): Promise<PaginatedData<AuditLog>> => {
    if (isDemoMode()) return getMockAuditPaginated(params?.page || 1, params?.limit || 50);
    const { data } = await apiClient.get<ApiResponse<PaginatedData<AuditLog>>>("/audit", { params });
    return data.data;
  },
};
