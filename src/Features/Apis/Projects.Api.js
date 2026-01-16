import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const projectsApi = createApi({
    reducerPath: 'projectsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://portifoliobackend-ezefe7h3c6hnb4em.southafricanorth-01.azurewebsites.net/api'
    }),
    tagTypes: ['Project'],
    endpoints: (builder) => ({
        getProjects: builder.query({
            query: () => '/projects',
            providesTags: (result) => result
                ? [
                    ...result.map(({ id }) => ({ type: 'Project', id })),
                    { type: 'Project', id: 'LIST' },
                ]
                : [{ type: 'Project', id: 'LIST' }],
        }),
        getProjectDetails: builder.query({
            query: (id) => `/projects/${id}`,
            providesTags: (result, error, id) => [{ type: 'Project', id }],
        }),
        getProjectBySlug: builder.query({
            query: (slug) => `/projects/slug/${slug}`,
            providesTags: (result, error, slug) => [{ type: 'Project', id: slug }],
        }),
        createProject: builder.mutation({
            query: (newProject) => ({
                url: '/projects',
                method: 'POST',
                body: newProject,
            }),
            invalidatesTags: [{ type: 'Project', id: 'LIST' }],
        }),
        updateProject: builder.mutation({
            query: ({ id, updates }) => ({
                url: `/projects/${id}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Project', id },
                { type: 'Project', id: 'LIST' },
            ],
        }),
        deleteProject: builder.mutation({
            query: (id) => ({
                url: `/projects/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Project', id: 'LIST' }],
        }),
    }),
});
export const { useGetProjectsQuery, useGetProjectBySlugQuery, useGetProjectDetailsQuery, useCreateProjectMutation, useUpdateProjectMutation, useDeleteProjectMutation, } = projectsApi;
