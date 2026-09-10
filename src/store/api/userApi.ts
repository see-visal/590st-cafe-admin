import { baseApi, unwrap } from "./baseApi";
import type {
  CreateStaffRequest,
  PageQuery,
  PageResponse,
  Role,
  UpdateProfileRequest,
  UpdateStaffRequest,
  UserResponse,
  UserStatus,
  UUID,
} from "./types";

interface UserListQuery extends PageQuery {
  role?: Role;
}

/**
 * Three separate backend resources share the `UserResponse` shape:
 *  - `/api/admin/users`    — super-admin directory with profile/status updates and deletion. The
 *                            customers screen is this list filtered to CUSTOMER.
 *  - `/api/admin/admins`   — full CRUD over admin accounts.
 *  - `/api/admin/baristas` — full CRUD over barista accounts.
 * The staff screen combines the latter two.
 */
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listUsers: builder.query<PageResponse<UserResponse>, UserListQuery | void>({
      query: (params) => ({ url: "/api/admin/users", params: params ?? undefined }),
      transformResponse: unwrap<PageResponse<UserResponse>>,
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),

    getUser: builder.query<UserResponse, UUID>({
      query: (id) => `/api/admin/users/${id}`,
      transformResponse: unwrap<UserResponse>,
      providesTags: (_r, _e, id) => [{ type: "User", id }],
    }),

    updateUserStatus: builder.mutation<UserResponse, { id: UUID; status: UserStatus }>({
      query: ({ id, status }) => ({
        url: `/api/admin/users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: unwrap<UserResponse>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
        { type: "Admin", id: "LIST" },
        { type: "Barista", id: "LIST" },
      ],
    }),

    updateUser: builder.mutation<UserResponse, { id: UUID; body: UpdateProfileRequest }>({
      query: ({ id, body }) => ({ url: `/api/admin/users/${id}`, method: "PATCH", body }),
      transformResponse: unwrap<UserResponse>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "User", id }, { type: "User", id: "LIST" },
        { type: "Admin", id: "LIST" }, { type: "Barista", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation<void, UUID>({
      query: (id) => ({ url: `/api/admin/users/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "User", id }, { type: "User", id: "LIST" },
        { type: "Admin", id: "LIST" }, { type: "Barista", id: "LIST" },
      ],
    }),

    // ---- admins ----

    uploadStaffAvatar: builder.mutation<UserResponse, { id: UUID; role: "ADMIN" | "BARISTA"; file: File }>({
      query: ({ id, role, file }) => {
        const body = new FormData();
        body.append("file", file);
        return { url: `/api/admin/${role === "ADMIN" ? "admins" : "baristas"}/${id}/avatar`, method: "POST", body };
      },
      transformResponse: unwrap<UserResponse>,
      invalidatesTags: (_r, _e, { id }) => [
        "Auth", { type: "User", id }, { type: "User", id: "LIST" },
        { type: "Admin", id: "LIST" }, { type: "Barista", id: "LIST" },
      ],
    }),

    listAdmins: builder.query<PageResponse<UserResponse>, PageQuery | void>({
      query: (params) => ({ url: "/api/admin/admins", params: params ?? undefined }),
      transformResponse: unwrap<PageResponse<UserResponse>>,
      providesTags: [{ type: "Admin", id: "LIST" }],
    }),

    createAdmin: builder.mutation<UserResponse, CreateStaffRequest>({
      query: (body) => ({ url: "/api/admin/admins", method: "POST", body }),
      transformResponse: unwrap<UserResponse>,
      invalidatesTags: [
        { type: "Admin", id: "LIST" },
        { type: "User", id: "LIST" },
      ],
    }),

    updateAdmin: builder.mutation<UserResponse, { id: UUID; body: UpdateStaffRequest }>({
      query: ({ id, body }) => ({
        url: `/api/admin/admins/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: unwrap<UserResponse>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "User", id },
        { type: "Admin", id: "LIST" },
        { type: "User", id: "LIST" },
      ],
    }),

    deleteAdmin: builder.mutation<void, UUID>({
      query: (id) => ({ url: `/api/admin/admins/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "User", id },
        { type: "Admin", id: "LIST" },
        { type: "User", id: "LIST" },
      ],
    }),

    // ---- baristas ----

    listBaristas: builder.query<PageResponse<UserResponse>, PageQuery | void>({
      query: (params) => ({ url: "/api/admin/baristas", params: params ?? undefined }),
      transformResponse: unwrap<PageResponse<UserResponse>>,
      providesTags: [{ type: "Barista", id: "LIST" }],
    }),

    createBarista: builder.mutation<UserResponse, CreateStaffRequest>({
      query: (body) => ({ url: "/api/admin/baristas", method: "POST", body }),
      transformResponse: unwrap<UserResponse>,
      invalidatesTags: [
        { type: "Barista", id: "LIST" },
        { type: "User", id: "LIST" },
      ],
    }),

    updateBarista: builder.mutation<UserResponse, { id: UUID; body: UpdateStaffRequest }>({
      query: ({ id, body }) => ({
        url: `/api/admin/baristas/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: unwrap<UserResponse>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "User", id },
        { type: "Barista", id: "LIST" },
        { type: "User", id: "LIST" },
      ],
    }),

    deleteBarista: builder.mutation<void, UUID>({
      query: (id) => ({ url: `/api/admin/baristas/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "User", id },
        { type: "Barista", id: "LIST" },
        { type: "User", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListUsersQuery,
  useGetUserQuery,
  useUpdateUserStatusMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUploadStaffAvatarMutation,
  useListAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useListBaristasQuery,
  useCreateBaristaMutation,
  useUpdateBaristaMutation,
  useDeleteBaristaMutation,
} = userApi;
