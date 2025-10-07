import type { ApiInstance } from '@useApi';

/**
 * Create system settings
 */
export async function createSettings(api: ApiInstance, adminToken: string): Promise<void> {
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

    console.log('  ⚙️ Creating system settings...');

    const settingsData = [
        {
            key: 'app_name',
            value: 'أجار - منصة العقارات',
            type: 'text',
            is_settings: true
        },
        {
            key: 'app_name_en',
            value: 'Ajar - Real Estate Platform',
            type: 'text',
            is_settings: true
        },
        {
            key: 'app_description',
            value: 'منصة شاملة للعقارات في الأردن',
            type: 'long_text',
            is_settings: true
        },
        {
            key: 'app_description_en',
            value: 'Comprehensive real estate platform in Jordan',
            type: 'long_text',
            is_settings: true
        },
        {
            key: 'contact_phone',
            value: '+962791234567',
            type: 'text',
            is_settings: true
        },
        {
            key: 'contact_email',
            value: 'info@ajar.com',
            type: 'text',
            is_settings: true
        },
        {
            key: 'max_images_per_listing',
            value: '25',
            type: 'int',
            is_settings: true
        },
        {
            key: 'max_file_size_mb',
            value: '10',
            type: 'int',
            is_settings: true
        },
        {
            key: 'maintenance_mode',
            value: 'false',
            type: 'bool',
            is_settings: true
        },
        {
            key: 'auto_approve_listings',
            value: 'false',
            type: 'bool',
            is_settings: true
        },
        {
            key: 'listing_expiry_days',
            value: '90',
            type: 'int',
            is_settings: true
        },
        {
            key: 'featured_listing_price',
            value: '50',
            type: 'float',
            is_settings: true
        },
        {
            key: 'supported_currencies',
            value: JSON.stringify(['JOD', 'USD', 'EUR']),
            type: 'json',
            is_settings: true
        },
        {
            key: 'social_links',
            value: JSON.stringify({
                facebook: 'https://facebook.com/ajar',
                twitter: 'https://twitter.com/ajar',
                instagram: 'https://instagram.com/ajar',
                linkedin: 'https://linkedin.com/company/ajar'
            }),
            type: 'json',
            is_settings: true
        }
    ];

    // Create settings in batch
    try {
        const response = await authApi.put('/admin/settings', {
            settings: settingsData
        });

        if (response.data?.success) {
            console.log(`    ✅ Created ${settingsData.length} system settings`);
        }
    } catch (error) {
        console.log('    ⚠️ Failed to create settings in batch, trying individually...');

        // Fallback: create settings individually
        for (const setting of settingsData) {
            try {
                await authApi.post('/admin/settings', setting);
                console.log(`    ✅ Created setting: ${setting.key}`);
            } catch (error) {
                console.log(`    ⚠️ Setting ${setting.key} might already exist`);
            }
        }
    }
}
