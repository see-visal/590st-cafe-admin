import { baseApi, unwrap } from "./baseApi";
import type { PageResponse } from "./types";

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  topic: string;
  message: string;
  status: "RECEIVED" | "RESOLVED";
  createdAt: string;
}

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listContactMessages: builder.query<PageResponse<ContactMessage>, { page: number; size: number; status?: ContactMessage["status"] }>({
      query: (params) => ({ url: "/api/admin/contact-messages", params }),
      transformResponse: unwrap<PageResponse<ContactMessage>>,
      providesTags: ["ContactMessage"],
    }),
    updateContactStatus: builder.mutation<ContactMessage, { id: string; status: ContactMessage["status"] }>({
      query: ({ id, status }) => ({ url: `/api/admin/contact-messages/${id}`, method: "PATCH", body: { status } }),
      transformResponse: unwrap<ContactMessage>,
      invalidatesTags: ["ContactMessage"],
    }),
  }),
});

export const { useListContactMessagesQuery, useUpdateContactStatusMutation } = contactApi;
