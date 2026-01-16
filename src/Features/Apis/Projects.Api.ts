import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// --- Interfaces ---
export interface ProjectLink {
  id: string;
  label: string;
  url: string;
  type: string;
}

export interface ProjectSection {
  id: string;
  sectionTitle: string;
  explanation: string;
  order: number;
  media?: { fileUrl: string };
}

export interface ProjectTimeline {
  id: string;
  title: string;
  description: string;
  date: string;
}

// 1. Added the Tech Interface to match your backend response
export interface ProjectTech {
  projectId: string;
  technologyId: string;
  // If your backend includes the joined technology data, add it here:
  technology?: {
    id: string;
    name: string;
    icon?: string;
  };
}

export interface Project {
  name: any;
  id: string;
  title: string;
  slug: string;
  mainDescription: string;
  mainThumbnailId: string;
  status: 'published' | 'draft' | 'archived';
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  thumbnail?: {
    fileUrl: string;
    fileName: string;
  };
  // 2. Included 'techs' in the Project interface
  techs: ProjectTech[]; 
  links: ProjectLink[];
  sections: ProjectSection[];
  timeline: ProjectTimeline[];
}

export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://portifoliobackend-ezefe7h3c6hnb4em.southafricanorth-01.azurewebsites.net/api' 
  }),
  tagTypes: ['Project'],
  endpoints: (builder) => ({
    
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Project' as const, id })),
              { type: 'Project', id: 'LIST' },
            ]
          : [{ type: 'Project', id: 'LIST' }],
    }),

    getProjectDetails: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),

    getProjectBySlug: builder.query<Project, string>({
      query: (slug) => `/projects/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Project', id: slug }],
    }),

    createProject: builder.mutation<Project, Partial<Project>>({
      query: (newProject) => ({
        url: '/projects',
        method: 'POST',
        body: newProject,
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),

    updateProject: builder.mutation<Project, { id: string; updates: Partial<Project> }>({
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

    deleteProject: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectBySlugQuery,
  useGetProjectDetailsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;