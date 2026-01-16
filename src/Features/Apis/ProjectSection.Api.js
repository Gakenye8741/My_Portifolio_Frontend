import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const ProjectSectionsApi = createApi({
    reducerPath: 'ProjectSectionsApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'https://portifoliobackend-ezefe7h3c6hnb4em.southafricanorth-01.azurewebsites.net/api' }),
    tagTypes: ['ProjectSections'],
    endpoints: (builder) => ({
        // --- FETCH ALL SECTIONS FOR A PROJECT ---
        getSectionsByProject: builder.query({
            query: (projectId) => `/project-sections/project/${projectId}`,
            providesTags: (result, error, projectId) => [{ type: 'ProjectSections', id: projectId }],
        }),
        // --- CREATE NEW SECTION ---
        createSection: builder.mutation({
            query: (newSection) => ({
                url: '/project-sections',
                method: 'POST',
                body: newSection,
            }),
            invalidatesTags: (result, error, { projectId }) => [
                { type: 'ProjectSections', id: projectId }
            ],
        }),
        // --- REORDER SECTIONS (BULK) ---
        reorderSections: builder.mutation({
            query: (reorderMap) => ({
                url: '/project-sections/reorder',
                method: 'POST',
                body: reorderMap,
            }),
            // This invalidates all sections to ensure the new order is reflected globally
            invalidatesTags: ['ProjectSections'],
        }),
        // --- UPDATE SECTION CONTENT ---
        updateSection: builder.mutation({
            query: ({ id, updates }) => ({
                url: `/project-sections/${id}`,
                method: 'PATCH',
                body: updates,
            }),
            invalidatesTags: ['ProjectSections'],
        }),
        // --- DELETE SECTION ---
        deleteSection: builder.mutation({
            query: (id) => ({
                url: `/project-sections/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ProjectSections'],
        }),
    }),
});
export const { useGetSectionsByProjectQuery, useCreateSectionMutation, useReorderSectionsMutation, useUpdateSectionMutation, useDeleteSectionMutation } = ProjectSectionsApi;
