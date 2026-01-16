import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const contentApi = createApi({
    reducerPath: 'contentApi',
    // Updated to your Azure Production Link
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://portifoliobackend-ezefe7h3c6hnb4em.southafricanorth-01.azurewebsites.net/api/'
    }),
    tagTypes: ['Content'],
    endpoints: (builder) => ({
        // ==========================================
        // 🔍 FETCHING DATA (Large Screen Grid View)
        // ==========================================
        // Get all content items filtered by page (e.g., 'home', 'about')
        getContentByPage: builder.query({
            query: (pageName) => `content/page/${pageName}`,
            providesTags: (result) => result
                ? [...result.map(({ id }) => ({ type: 'Content', id })), 'Content']
                : ['Content'],
        }),
        // Get a specific block (e.g., for a "Hero" specific editor)
        getContentByKey: builder.query({
            query: (key) => `content/key/${key}`,
            providesTags: (result, error, key) => [{ type: 'Content', id: key }],
        }),
        // ==========================================
        // ✍️ MUTATIONS (Update/Create/Delete)
        // ==========================================
        // Create or Update Content (The "Upsert" logic)
        upsertContent: builder.mutation({
            query: (payload) => ({
                url: 'content',
                method: 'POST',
                body: payload,
            }),
            // Automatically refreshes the UI after saving
            invalidatesTags: ['Content'],
        }),
        // Delete a content block by UUID
        deleteContent: builder.mutation({
            query: (id) => ({
                url: `content/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Content'],
        }),
    }),
});
// ✅ Hooks for your High-Resolution Dashboard
export const { useGetContentByPageQuery, useGetContentByKeyQuery, useUpsertContentMutation, useDeleteContentMutation, } = contentApi;
