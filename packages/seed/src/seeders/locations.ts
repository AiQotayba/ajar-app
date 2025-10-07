import type { ApiInstance } from '@useApi';

interface Governorate {
    id: number;
    name: { ar: string; en: string };
}

interface City {
    id: number;
    governorate_id: number;
    name: { ar: string; en: string };
}

/**
 * Create governorates and cities
 */
export async function createLocations(api: ApiInstance, adminToken: string): Promise<{ governorates: Governorate[]; cities: City[] }> {
    const governorates: Governorate[] = [];
    const cities: City[] = [];

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

    console.log('  🗺️ Creating governorates...');

    const governoratesData = [
        {
            name: { ar: 'عمان', en: 'Amman' },
            code: 'AMM'
        },
        {
            name: { ar: 'الزرقاء', en: 'Zarqa' },
            code: 'ZRQ'
        },
        {
            name: { ar: 'إربد', en: 'Irbid' },
            code: 'IRB'
        },
        {
            name: { ar: 'العقبة', en: 'Aqaba' },
            code: 'AQB'
        },
        {
            name: { ar: 'البلقاء', en: 'Balqa' },
            code: 'BLQ'
        }
    ];

    // Create governorates
    for (const govData of governoratesData) {
        try {
            const response = await authApi.post('/admin/governorates', govData);
            if (response.data?.data) {
                governorates.push(response.data.data);
                console.log(`    ✅ Created governorate: ${govData.name.ar}`);
            }
        } catch (error) {
            console.log(`    ⚠️ Governorate ${govData.name.ar} might already exist`);
        }
    }

    console.log('  🏙️ Creating cities...');

    const citiesData = [
        // Amman cities
        { governorate_id: governorates[0]?.id, name: { ar: 'الجبيهة', en: 'Jubaiha' }, place_id: 'ChIJXYZ123456789' },
        { governorate_id: governorates[0]?.id, name: { ar: 'الشميساني', en: 'Shmeisani' }, place_id: 'ChIJABC123456789' },
        { governorate_id: governorates[0]?.id, name: { ar: 'الدوار السابع', en: 'Dawar Al-Sabi' }, place_id: 'ChIJDEF123456789' },
        { governorate_id: governorates[0]?.id, name: { ar: 'الزرقاء الجديدة', en: 'New Zarqa' }, place_id: 'ChIJGHI123456789' },
        { governorate_id: governorates[0]?.id, name: { ar: 'المرج', en: 'Marj Al-Hamam' }, place_id: 'ChIJJKL123456789' },

        // Zarqa cities
        { governorate_id: governorates[1]?.id, name: { ar: 'الزرقاء', en: 'Zarqa' }, place_id: 'ChIJMNO123456789' },
        { governorate_id: governorates[1]?.id, name: { ar: 'الرصيفة', en: 'Russeifa' }, place_id: 'ChIJPQR123456789' },

        // Irbid cities
        { governorate_id: governorates[2]?.id, name: { ar: 'إربد', en: 'Irbid' }, place_id: 'ChIJSTU123456789' },
        { governorate_id: governorates[2]?.id, name: { ar: 'الرمثا', en: 'Ramtha' }, place_id: 'ChIJVWX123456789' },

        // Aqaba cities
        { governorate_id: governorates[3]?.id, name: { ar: 'العقبة', en: 'Aqaba' }, place_id: 'ChIJYZ123456789' },

        // Balqa cities
        { governorate_id: governorates[4]?.id, name: { ar: 'السلط', en: 'Salt' }, place_id: 'ChIJ0123456789' },
        { governorate_id: governorates[4]?.id, name: { ar: 'مادبا', en: 'Madaba' }, place_id: 'ChIJ3456789' }
    ];

    // Create cities
    for (const cityData of citiesData) {
        if (cityData.governorate_id) {
            try {
                const response = await authApi.post('/admin/cities', {
                    ...cityData,
                    availability: true
                });
                if (response.data?.data) {
                    cities.push(response.data.data);
                    console.log(`    ✅ Created city: ${cityData.name.ar}`);
                }
            } catch (error) {
                console.log(`    ⚠️ City ${cityData.name.ar} might already exist`);
            }
        }
    }

    return { governorates, cities };
}
