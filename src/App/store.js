import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "../Features/Auth/AuthSlice";
import { authApi } from "../Features/Apis/AuthApi";
import { contentApi } from "../Features/Apis/Content.Api";
import { SkillsApi } from "../Features/Apis/Skills.Api";
import { projectsApi } from "../Features/Apis/Projects.Api";
import { mediaApi } from "../Features/Apis/Media.Api";
import { ProjectLinksApi } from "../Features/Apis/ProjectLinks.Api";
import { ProjectSectionsApi } from "../Features/Apis/ProjectSection.Api";
import { ProjectTechApi } from "../Features/Apis/ProjectTech.Api";
import { projectTimelineApi } from "../Features/Apis/ProjectTimeline.Api";
// Create Persist Configuration for auth Slice
const authPersistConfiguration = {
    key: 'auth',
    storage,
    whitelist: ['user', 'token', 'isAuthenticated', 'role']
};
//  Create A persistent Reducer for the AUTH
const persistedAuthReducer = persistReducer(authPersistConfiguration, authReducer);
export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        [authApi.reducerPath]: authApi.reducer,
        [contentApi.reducerPath]: contentApi.reducer,
        [SkillsApi.reducerPath]: SkillsApi.reducer,
        [projectsApi.reducerPath]: projectsApi.reducer,
        [mediaApi.reducerPath]: mediaApi.reducer,
        [ProjectLinksApi.reducerPath]: ProjectLinksApi.reducer,
        [ProjectSectionsApi.reducerPath]: ProjectSectionsApi.reducer,
        [ProjectTechApi.reducerPath]: ProjectTechApi.reducer,
        [projectTimelineApi.reducerPath]: projectTimelineApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }).concat(authApi.middleware, contentApi.middleware, SkillsApi.middleware, projectsApi.middleware, mediaApi.middleware, ProjectLinksApi.middleware, ProjectSectionsApi.middleware, ProjectTechApi.middleware, projectTimelineApi.middleware)
});
export const persister = persistStore(store);
