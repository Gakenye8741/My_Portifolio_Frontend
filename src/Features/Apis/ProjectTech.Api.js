import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const ProjectTechApi = createApi({
    reducerPath: 'ProjectTechApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://portifoliobackend-ezefe7h3c6hnb4em.southafricanorth-01.azurewebsites.net/api'
    }),
    tagTypes: ['ProjectTech'],
    endpoints: (builder) => ({
        // --- FETCH TECH STACK FOR A PROJECT ---
        getProjectTechStack: builder.query({
            query: (projectId) => `/project-tech/${projectId}`,
            providesTags: (result, error, projectId) => [{ type: 'ProjectTech', id: projectId }],
        }),
        // --- SYNC TECH STACK (BULK OVERWRITE) ---
        // Best used for checkbox lists in edit forms
        syncProjectTech: builder.mutation({
            query: ({ projectId, body }) => ({
                url: `/project-tech/${projectId}/sync`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (result, error, { projectId }) => [
                { type: 'ProjectTech', id: projectId }
            ],
        }),
        // --- APPEND TECH TO STACK ---
        addTechToProject: builder.mutation({
            query: ({ projectId, body }) => ({
                url: `/project-tech/${projectId}`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error, { projectId }) => [
                { type: 'ProjectTech', id: projectId }
            ],
        }),
        // --- REMOVE SINGLE TECH FROM STACK ---
        removeTechFromProject: builder.mutation({
            query: ({ projectId, techId }) => ({
                url: `/project-tech/${projectId}/${techId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { projectId }) => [
                { type: 'ProjectTech', id: projectId }
            ],
        }),
    }),
});
export const { useGetProjectTechStackQuery, useSyncProjectTechMutation, useAddTechToProjectMutation, useRemoveTechFromProjectMutation } = ProjectTechApi;
