"use client"

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/lib/redux/store';
import { ReactNode } from 'react';

interface ReduxProviderProps {
    children: ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
    // Ensure store is available (should always be true on client side)
    if (!store || !persistor) {
        console.error('Redux store or persistor is not available');
        return <>{children}</>;
    }

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    );
}

