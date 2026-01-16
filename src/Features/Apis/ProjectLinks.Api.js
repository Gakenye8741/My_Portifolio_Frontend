import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const ProjectLinksApi = createApi({
    reducerPath: 'ProjectLinksApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://portifoliobackend-ezefe7h3c6hnb4em.southafricanorth-01.azurewebsites.net/api',
        prepareHeaders: (headers) => {
            // You can pull the token from your AuthSlice here if needed
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['ProjectLinks'],
    endpoints: (builder) => ({
        // --- GET ALL LINKS FOR A SPECIFIC PROJECT ---
        getLinksByProjectId: builder.query({
            query: (projectId) => `/project-links/project/${projectId}`,
            providesTags: (result, error, projectId) => [{ type: 'ProjectLinks', id: projectId }],
        }),
        // --- SYNC LINKS (BULK UPDATE) ---
        // This replaces all existing links for a project with a new set
        syncProjectLinks: builder.mutation({
            query: ({ projectId, links }) => ({
                url: `/project-links/project/${projectId}/sync`,
                method: 'POST',
                body: links,
            }),
            // Invalidates the list for this specific project to trigger a re-fetch
            invalidatesTags: (result, error, { projectId }) => [
                { type: 'ProjectLinks', id: projectId }
            ],
        }),
        // --- DELETE INDIVIDUAL LINK (IF NEEDED) ---
        deleteProjectLink: builder.mutation({
            query: (linkId) => ({
                url: `/project-links/${linkId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ProjectLinks'],
        }),
    }),
});
export const { useGetLinksByProjectIdQuery, useSyncProjectLinksMutation, useDeleteProjectLinkMutation } = ProjectLinksApi;
