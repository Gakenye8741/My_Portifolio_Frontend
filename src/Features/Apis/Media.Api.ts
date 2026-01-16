import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../App/store';

export interface MediaAsset {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://portifoliobackend-ezefe7h3c6hnb4em.southafricanorth-01.azurewebsites.net/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token; 
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Media'],
  endpoints: (builder) => ({
    getMediaAssets: builder.query<MediaAsset[], void>({
      query: () => '/media',
      providesTags: (result) => result ? [...result.map(({ id }) => ({ type: 'Media' as const, id })), { type: 'Media', id: 'LIST' }] : [{ type: 'Media', id: 'LIST' }],
    }),
    createMediaAsset: builder.mutation<MediaAsset, Partial<MediaAsset>>({
      query: (newMedia) => ({ url: '/media', method: 'POST', body: newMedia }),
      invalidatesTags: [{ type: 'Media', id: 'LIST' }],
    }),
    deleteMediaAsset: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/media/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Media', id: 'LIST' }],
    }),
  }),
});

export const { useGetMediaAssetsQuery, useCreateMediaAssetMutation, useDeleteMediaAssetMutation } = mediaApi;