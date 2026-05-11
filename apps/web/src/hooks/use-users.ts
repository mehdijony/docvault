import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../lib/api/users";
import type { UserRole } from "../types";
import { toast } from "sonner";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.list(),
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: () => usersApi.getMe(),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      usersApi.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User role updated successfully");
    },
    onError: () => {
      toast.error("Failed to update user role");
    },
  });
}
