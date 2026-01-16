import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// --- TYPES ---
export interface ProjectSection {
  id: string;
  projectId: string;
  sectionTitle: string;
  explanation: string;
  order: number;
  mediaId?: string;
  media?: {
    fileUrl: string;
    fileType: string;
  };
  createdAt: string;
}

export interface CreateSectionRequest {
  projectId: string;
  sectionTitle: string;
  explanation: string;
  order: number;
  mediaId?: string;
}

export interface ReorderRequest {
  id: string;
  order: number;
}

export const ProjectSectionsApi = createApi({
  reducerPath: 'ProjectSectionsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://portifoliobackend-ezefe7h3c6hnb4em.southafricanorth-01.azurewebsites.net/api' }),
  tagTypes: ['ProjectSections'],
  endpoints: (builder) => ({
    
    // --- FETCH ALL SECTIONS FOR A PROJECT ---
    getSectionsByProject: builder.query<ProjectSection[], string>({
      query: (projectId) => `/project-sections/project/${projectId}`,
      providesTags: (result, error, projectId) => [{ type: 'ProjectSections', id: projectId }],
    }),

    // --- CREATE NEW SECTION ---
    createSection: builder.mutation<ProjectSection, CreateSectionRequest>({
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
    reorderSections: builder.mutation<void, ReorderRequest[]>({
      query: (reorderMap) => ({
        url: '/project-sections/reorder',
        method: 'POST',
        body: reorderMap,
      }),
      // This invalidates all sections to ensure the new order is reflected globally
      invalidatesTags: ['ProjectSections'],
    }),

    // --- UPDATE SECTION CONTENT ---
    updateSection: builder.mutation<ProjectSection, { id: string; updates: Partial<CreateSectionRequest> }>({
      query: ({ id, updates }) => ({
        url: `/project-sections/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['ProjectSections'],
    }),

    // --- DELETE SECTION ---
    deleteSection: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/project-sections/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProjectSections'],
    }),
  }),
});

export const { 
  useGetSectionsByProjectQuery, 
  useCreateSectionMutation, 
  useReorderSectionsMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation 
} = ProjectSectionsApi;