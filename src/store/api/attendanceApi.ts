import { baseApi, unwrap } from "./baseApi";
import type { ApiEnvelope, PageQuery, PageResponse, Role, UUID } from "./types";

export interface AttendanceQuery extends PageQuery {
  baristaId?: UUID;
  from?: string;
  to?: string;
}
export interface AttendanceInput {
  baristaId: UUID;
  checkInAt: string;
  checkOutAt?: string;
  note?: string;
}

export interface AttendanceResponse {
  id: UUID;
  baristaId: UUID;
  baristaName: string;
  checkInAt: string;
  checkOutAt: string | null;
  workedMinutes: number | null;
  open: boolean;
  note: string | null;
}
export interface AttendanceHistoryResponse {
  id: UUID;
  attendanceId: UUID;
  action: string;
  actorId: UUID;
  actorName: string | null;
  actorRole: Role | null;
  note: string | null;
  createdAt: string;
}

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listAttendance: builder.query<PageResponse<AttendanceResponse>, AttendanceQuery>({
      query: (params) => ({ url: "/api/admin/attendance", params }),
      transformResponse: unwrap<PageResponse<AttendanceResponse>>,
      providesTags: ["Attendance"],
    }),
    getAttendanceHistory: builder.query<AttendanceHistoryResponse[], UUID>({
      query: (id) => `/api/admin/attendance/${id}/history`,
      transformResponse: unwrap<AttendanceHistoryResponse[]>,
      providesTags: ["Attendance"],
    }),
    listMyAttendance: builder.query<PageResponse<AttendanceResponse>, PageQuery>({
      query: (params) => ({ url: "/api/barista/attendance", params }),
      transformResponse: unwrap<PageResponse<AttendanceResponse>>,
      providesTags: ["Attendance"],
    }),
    getCurrentShift: builder.query<AttendanceResponse | null, void>({
      async queryFn(_arg, _api, _options, baseQuery) {
        const result = await baseQuery("/api/barista/attendance/current");
        if (result.error?.status === 404) return { data: null };
        if (result.error) return { error: result.error };
        return { data: (result.data as ApiEnvelope<AttendanceResponse>).data };
      },
      providesTags: ["Attendance"],
    }),
    checkIn: builder.mutation<AttendanceResponse, void>({
      query: () => ({ url: "/api/barista/attendance/check-in", method: "POST" }),
      transformResponse: unwrap<AttendanceResponse>,
      invalidatesTags: ["Attendance"],
    }),
    checkOut: builder.mutation<AttendanceResponse, void>({
      query: () => ({ url: "/api/barista/attendance/check-out", method: "POST" }),
      transformResponse: unwrap<AttendanceResponse>,
      invalidatesTags: ["Attendance"],
    }),
    createAttendance: builder.mutation<AttendanceResponse, AttendanceInput>({
      query: (body) => ({ url: "/api/admin/attendance", method: "POST", body }),
      transformResponse: unwrap<AttendanceResponse>,
      invalidatesTags: ["Attendance"],
    }),
    updateAttendance: builder.mutation<AttendanceResponse, { id: UUID; body: Omit<AttendanceInput, "baristaId"> }>({
      query: ({ id, body }) => ({ url: `/api/admin/attendance/${id}`, method: "PATCH", body }),
      transformResponse: unwrap<AttendanceResponse>,
      invalidatesTags: ["Attendance"],
    }),
  }),
});

export const { useListAttendanceQuery, useGetAttendanceHistoryQuery, useListMyAttendanceQuery,
  useGetCurrentShiftQuery, useCheckInMutation, useCheckOutMutation, useCreateAttendanceMutation,
  useUpdateAttendanceMutation } = attendanceApi;
