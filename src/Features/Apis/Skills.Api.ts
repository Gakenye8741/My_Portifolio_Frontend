import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// --- TYPES ---
export interface MediaAsset {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface TechSkill {
  iconUrl: string | undefined;
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'language' | 'database' | 'tools';
  iconId: string;
  icon?: MediaAsset;
  skill?: {
    proficiency: number;
    yearsExperience: number;
  };
}

// --- API SERVICE ---
export const SkillsApi = createApi({
  reducerPath: 'SkillsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://portifoliobackend-ezefe7h3c6hnb4em.southafricanorth-01.azurewebsites.net/api' }),
  tagTypes: ['TechSkill', 'Media'],
  endpoints: (builder) => ({
    
    // 1. Create Media Asset (Icon)
    createMedia: builder.mutation<MediaAsset, Partial<MediaAsset>>({
      query: (body) => ({
        url: '/media',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Media'],
    }),

    // 2. Create Tech + Skill (Transactional)
    createTechSkill: builder.mutation<TechSkill, { techData: any; skillData: any }>({
      query: (body) => ({
        url: '/tech-skills',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TechSkill'],
    }),

    // 3. Get All Tech & Skills (with optional category filter)
    getTechSkills: builder.query<TechSkill[], string | void>({
      query: (category) => ({
        url: '/tech-skills',
        params: category ? { category } : undefined,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'TechSkill' as const, id })), { type: 'TechSkill', id: 'LIST' }]
          : [{ type: 'TechSkill', id: 'LIST' }],
    }),

    // 5. Update Tech + Skill
    updateTechSkill: builder.mutation<TechSkill, { id: string; techUpdates: any; skillUpdates?: any }>({
      query: ({ id, ...body }) => ({
        url: `/tech-skills/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'TechSkill', id }],
    }),

    // 6. Delete Technology
    deleteTechSkill: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/tech-skills/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'TechSkill', id: 'LIST' }],
    }),
  }),
});

export const {
  useCreateMediaMutation,
  useCreateTechSkillMutation,
  useGetTechSkillsQuery,
  useUpdateTechSkillMutation,
  useDeleteTechSkillMutation,
} = SkillsApi;