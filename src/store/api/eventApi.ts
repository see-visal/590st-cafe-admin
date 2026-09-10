import { baseApi, unwrap } from "./baseApi";
import type {
  CreateEventRequest,
  EventResponse,
  PageQuery,
  PageResponse,
  UpdateEventRequest,
  UUID,
} from "./types";

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listEvents: builder.query<PageResponse<EventResponse>, PageQuery | void>({
      query: (params) => ({ url: "/api/admin/events", params: params ?? undefined }),
      transformResponse: unwrap<PageResponse<EventResponse>>,
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: "Event" as const, id })),
              { type: "Event" as const, id: "LIST" },
            ]
          : [{ type: "Event" as const, id: "LIST" }],
    }),

    getEvent: builder.query<EventResponse, UUID>({
      query: (id) => `/api/admin/events/${id}`,
      transformResponse: unwrap<EventResponse>,
      providesTags: (_r, _e, id) => [{ type: "Event", id }],
    }),

    createEvent: builder.mutation<EventResponse, CreateEventRequest>({
      query: (body) => ({ url: "/api/admin/events", method: "POST", body }),
      transformResponse: unwrap<EventResponse>,
      invalidatesTags: [{ type: "Event", id: "LIST" }],
    }),

    updateEvent: builder.mutation<EventResponse, { id: UUID; body: UpdateEventRequest }>({
      query: ({ id, body }) => ({ url: `/api/admin/events/${id}`, method: "PATCH", body }),
      transformResponse: unwrap<EventResponse>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Event", id },
        { type: "Event", id: "LIST" },
      ],
    }),

    deleteEvent: builder.mutation<void, UUID>({
      query: (id) => ({ url: `/api/admin/events/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Event", id },
        { type: "Event", id: "LIST" },
      ],
    }),

    uploadEventImage: builder.mutation<EventResponse, { id: UUID; file: File }>({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return { url: `/api/admin/events/${id}/image`, method: "POST", body: formData };
      },
      transformResponse: unwrap<EventResponse>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Event", id },
        { type: "Event", id: "LIST" },
      ],
    }),

    removeEventImage: builder.mutation<EventResponse, UUID>({
      query: (id) => ({ url: `/api/admin/events/${id}/image`, method: "DELETE" }),
      transformResponse: unwrap<EventResponse>,
      invalidatesTags: (_r, _e, id) => [
        { type: "Event", id },
        { type: "Event", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useUploadEventImageMutation,
  useRemoveEventImageMutation,
} = eventApi;
