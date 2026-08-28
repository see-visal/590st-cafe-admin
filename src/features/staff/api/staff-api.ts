import { apiClient } from "@/lib/api/axios";
import type {
  BackendStaff,
  Staff,
  StaffCreatePayload,
} from "@/features/staff/types/staff.type";

const STAFF_ENDPOINT = "/api/v1/staff";

function mapStaff(raw: BackendStaff): Staff {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone || "",
    role: raw.role,
    status: raw.status,
    joinDate: raw.joinDate,
  };
}

export const staffApi = {
  getAll: async () => (await apiClient.get<BackendStaff[]>(STAFF_ENDPOINT)).map(mapStaff),
  getById: async (id: number) => mapStaff(await apiClient.get<BackendStaff>(`${STAFF_ENDPOINT}/${id}`)),
  create: async (data: StaffCreatePayload) =>
    mapStaff(await apiClient.post<BackendStaff>(STAFF_ENDPOINT, {
      fullName: data.name,
      email: data.email,
      username: data.username || data.email.split("@")[0],
      password: data.password || "ChangeMe123!",
      phoneNumber: data.phone,
      role: data.role,
    })),
  update: async (id: number, data: Partial<Staff>) =>
    mapStaff(await apiClient.put<BackendStaff>(`${STAFF_ENDPOINT}/${id}`, {
      fullName: data.name,
      phoneNumber: data.phone,
      role: data.role,
      status: data.status,
    })),
  delete: (id: number) => apiClient.delete(`${STAFF_ENDPOINT}/${id}`),
};
