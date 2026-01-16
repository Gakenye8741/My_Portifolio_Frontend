import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// --- API DEFINITION ---
export const projectTimelineApi = createApi({
    reducerPath: 'projectTimelineApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5000/api',
        prepareHeaders: (headers, { getState }) => {
            // Injects the JWT token if you have authentication set up
            const token = getState().auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Timeline'], // Used for automatic refreshing
    endpoints: (builder) => ({
        // 1️⃣ Create Timeline Event
        createTimelineEvent: builder.mutation({
            query: (newEvent) => ({
                url: '/project-timeline',
                method: 'POST',
                body: newEvent,
            }),
            // Refresh the list after creation
            invalidatesTags: ['Timeline'],
        }),
        // 2️⃣ Get All Timeline Events for a Specific Project
        // Endpoint: GET /project-timeline/project/{{projectId}}
        getProjectTimeline: builder.query({
            query: (projectId) => `/project-timeline/project/${projectId}`,
            providesTags: (result) => result
                ? [
                    ...result.map(({ id }) => ({ type: 'Timeline', id })),
                    { type: 'Timeline', id: 'LIST' },
                ]
                : [{ type: 'Timeline', id: 'LIST' }],
        }),
        // 3️⃣ Update a Timeline Event
        // Endpoint: PUT /project-timeline/{{timelineId}}
        updateTimelineEvent: builder.mutation({
            query: ({ id, ...updates }) => ({
                url: `/project-timeline/${id}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Timeline', id },
                { type: 'Timeline', id: 'LIST' }
            ],
        }),
        // 4️⃣ Delete a Timeline Event
        // Endpoint: DELETE /project-timeline/{{timelineId}}
        deleteTimelineEvent: builder.mutation({
            query: (timelineId) => ({
                url: `/project-timeline/${timelineId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Timeline'],
        }),
    }),
});
// Export hooks for use in functional components
export const { useCreateTimelineEventMutation, useGetProjectTimelineQuery, useUpdateTimelineEventMutation, useDeleteTimelineEventMutation, } = projectTimelineApi;
