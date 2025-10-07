#!/usr/bin/env node

import { createApi, type ApiInstance } from '@useApi';
import { seedData } from './seed-data';

// API Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api/v1';

// Create API instance
const api: ApiInstance = createApi({
    baseUrl: API_BASE_URL,
    defaultTimeout: 30000,
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        console.log(`[${type.toUpperCase()}] ${message}`);
    },
    onError: (error: Error) => {
        console.error('[ERROR]', error.message);
    }
});

/**
 * Main seed function
 */
async function main() {
    console.log('🌱 Starting Ajar Real Estate Seed Script...');
    console.log(`📡 API Base URL: ${API_BASE_URL}`);

    try {
        // Start seeding process
        await seedData(api);

        console.log('✅ Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

// Run the seed script
if (require.main === module) {
    main();
}

export { seedData };

