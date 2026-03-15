"use client"

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import homeReducer from './slices/homeSlice';

// Persist configuration for auth
const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['user', 'token', 'isAuthenticated'], // Only persist these fields
};

// Persist configuration for home cache (footer, categories, governorates, cities) - 5 min TTL checked in app
const homePersistConfig = {
    key: 'homeCache',
    storage,
    whitelist: ['footer', 'categories', 'governorates', 'cities', 'fetchedAt'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedHomeReducer = persistReducer(homePersistConfig, homeReducer);

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        home: persistedHomeReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

