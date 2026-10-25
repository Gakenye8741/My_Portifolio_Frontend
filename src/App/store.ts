import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "../Features/Auth/AuthSlice"
import { authApi } from "../Features/Apis/AuthApi";
import { contentApi } from "../Features/Apis/Content.Api";

import { projectsApi } from "../Features/Apis/Projects.Api";
import { mediaApi } from "../Features/Apis/Media.Api";


// import { ProjectTechApi } from "../Features/Apis/ProjectTech.Api";
import { skillsApi } from "../Features/Apis/Skills.Api";
import { testimonialsApi } from "../Features/Apis/Testimonials.Api";
import { certificationsApi } from "../Features/Apis/Certifications.Api";
import { servicesApi } from "../Features/Apis/Services.Api";
import { contactApi } from "../Features/Apis/Contact.Api";
import { postsApi } from "../Features/Apis/PostApi";
import { technologiesApi } from "../Features/Apis/Technologies.Api";
import { faqsApi } from "../Features/Apis/FAQs.Api";


// Create Persist Configuration for auth Slice

 const authPersistConfiguration ={
    key: 'auth',
    storage,
    whitelist: ['user','token','isAuthenticated','role']
 }
//  Create A persistent Reducer for the AUTH
const persistedAuthReducer =persistReducer(authPersistConfiguration,authReducer)


export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        [authApi.reducerPath]: authApi.reducer,
        [contentApi.reducerPath]: contentApi.reducer,
        [skillsApi.reducerPath]: skillsApi.reducer,
        [projectsApi.reducerPath]: projectsApi.reducer,
        [mediaApi.reducerPath]: mediaApi.reducer,
        

        [testimonialsApi.reducerPath]: testimonialsApi.reducer,
        [certificationsApi.reducerPath]: certificationsApi.reducer,
        [servicesApi.reducerPath]: servicesApi.reducer,
        [contactApi.reducerPath]: contactApi.reducer,
        [postsApi.reducerPath]: postsApi.reducer,
        [technologiesApi.reducerPath]:technologiesApi.reducer,
        [faqsApi.reducerPath]: faqsApi.reducer,
    },
    middleware: (getDefaultMiddleware)=>
        getDefaultMiddleware({
            serializableCheck: false
        }).concat( authApi.middleware,contentApi.middleware,skillsApi.middleware,projectsApi.middleware,mediaApi.middleware,testimonialsApi.middleware,certificationsApi.middleware,servicesApi.middleware,contactApi.middleware,postsApi.middleware,technologiesApi.middleware,faqsApi.middleware)
})

export const persister = persistStore(store);
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch