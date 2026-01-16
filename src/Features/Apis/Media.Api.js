import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const mediaApi = createApi({
    reducerPath: 'mediaApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://portifoliobackend-ezefe7h3c6hnb4em.southafricanorth-01.azurewebsites.net/api',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token)
                headers.set('authorization', `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ['Media'],
    endpoints: (builder) => ({
        getMediaAssets: builder.query({
            query: () => '/media',
            providesTags: (result) => result ? [...result.map(({ id }) => ({ type: 'Media', id })), { type: 'Media', id: 'LIST' }] : [{ type: 'Media', id: 'LIST' }],
        }),
        createMediaAsset: builder.mutation({
            query: (newMedia) => ({ url: '/media', method: 'POST', body: newMedia }),
            invalidatesTags: [{ type: 'Media', id: 'LIST' }],
        }),
        deleteMediaAsset: builder.mutation({
            query: (id) => ({ url: `/media/${id}`, method: 'DELETE' }),
            invalidatesTags: [{ type: 'Media', id: 'LIST' }],
        }),
    }),
});
export const { useGetMediaAssetsQuery, useCreateMediaAssetMutation, useDeleteMediaAssetMutation } = mediaApi;
