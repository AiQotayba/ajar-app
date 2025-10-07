import type { ApiInstance } from '@useApi';

/**
 * Create sliders
 */
export async function createSliders(api: ApiInstance, adminToken: string): Promise<void> {
    // Set authorization header
    const authApi = {
        ...api,
        request: (method: any, endpoint: string, data?: any, options?: any) =>
            api.request(method, endpoint, data, {
                ...options,
                headers: {
                    ...options?.headers,
                    'Authorization': `Bearer ${adminToken}`
                }
            })
    };

    console.log('  🎚️ Creating sliders...');

    const slidersData = [
        {
            image_url: 'https://example.com/slider1.jpg',
            target_url: 'https://example.com/promotion1',
            start_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
            end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
            active: true
        },
        {
            image_url: 'https://example.com/slider2.jpg',
            target_url: 'https://example.com/promotion2',
            start_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
            end_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
            active: true
        },
        {
            image_url: 'https://example.com/slider3.jpg',
            target_url: null,
            start_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
            end_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
            active: false
        }
    ];

    for (const slider of slidersData) {
        try {
            const response = await authApi.post('/admin/sliders', slider);
            if (response.data?.data) {
                console.log(`    ✅ Created slider: ${slider.image_url}`);
            }
        } catch (error) {
            console.log(`    ⚠️ Slider might already exist: ${slider.image_url}`);
        }
    }
}
