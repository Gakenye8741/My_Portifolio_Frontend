import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// --- API SERVICE ---
export const SkillsApi = createApi({
    reducerPath: 'SkillsApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'https://portifoliobackend-ezefe7h3c6hnb4em.southafricanorth-01.azurewebsites.net/api' }),
    tagTypes: ['TechSkill', 'Media'],
    endpoints: (builder) => ({
        // 1. Create Media Asset (Icon)
        createMedia: builder.mutation({
            query: (body) => ({
                url: '/media',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Media'],
        }),
        // 2. Create Tech + Skill (Transactional)
        createTechSkill: builder.mutation({
            query: (body) => ({
                url: '/tech-skills',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['TechSkill'],
        }),
        // 3. Get All Tech & Skills (with optional category filter)
        getTechSkills: builder.query({
            query: (category) => ({
                url: '/tech-skills',
                params: category ? { category } : undefined,
            }),
            providesTags: (result) => result
                ? [...result.map(({ id }) => ({ type: 'TechSkill', id })), { type: 'TechSkill', id: 'LIST' }]
                : [{ type: 'TechSkill', id: 'LIST' }],
        }),
        // 5. Update Tech + Skill
        updateTechSkill: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/tech-skills/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'TechSkill', id }],
        }),
        // 6. Delete Technology
        deleteTechSkill: builder.mutation({
            query: (id) => ({
                url: `/tech-skills/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'TechSkill', id: 'LIST' }],
        }),
    }),
});
export const { useCreateMediaMutation, useCreateTechSkillMutation, useGetTechSkillsQuery, useUpdateTechSkillMutation, useDeleteTechSkillMutation, } = SkillsApi;
