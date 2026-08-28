import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { staffApi } from "@/features/staff/api/staff-api";
import { staffQueryKeys } from "@/features/staff/constants/staff-query-keys";
import type { StaffCreatePayload } from "@/features/staff/types/staff.type";

export function useCreateStaff() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: StaffCreatePayload) => staffApi.create(data),
    onSuccess: () => {
      toast.success("Staff member added");
      void queryClient.invalidateQueries({ queryKey: staffQueryKeys.all });
    },
    onError: () => toast.error("Failed to add staff member"),
  });
  return { create: mutation.mutateAsync, isLoading: mutation.isPending };
}
