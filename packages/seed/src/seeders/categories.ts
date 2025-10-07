import type { ApiInstance } from '@useApi';

interface Category {
    id: number;
    name: { ar: string; en: string };
}

interface Property {
    id: number;
    category_id: number;
}

interface Feature {
    id: number;
    category_id: number;
}

/**
 * Create categories, properties, and features
 */
export async function createCategories(api: ApiInstance, adminToken: string): Promise<Category[]> {
    const categories: Category[] = [];

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

    console.log('  📂 Creating main categories...');

    const mainCategories = [
        {
            name: { ar: 'شقق', en: 'Apartments' },
            description: { ar: 'شقق سكنية', en: 'Residential Apartments' },
            icon: 'fas fa-building',
            properties_source: 'custom',
            is_visible: true
        },
        {
            name: { ar: 'فيلا', en: 'Villa' },
            description: { ar: 'فيلا سكنية', en: 'Residential Villa' },
            icon: 'fas fa-home',
            properties_source: 'custom',
            is_visible: true
        },
        {
            name: { ar: 'أرض', en: 'Land' },
            description: { ar: 'قطع أرض', en: 'Land Plots' },
            icon: 'fas fa-map',
            properties_source: 'custom',
            is_visible: true
        },
        {
            name: { ar: 'مكتب', en: 'Office' },
            description: { ar: 'مكاتب تجارية', en: 'Commercial Offices' },
            icon: 'fas fa-briefcase',
            properties_source: 'custom',
            is_visible: true
        },
        {
            name: { ar: 'محل', en: 'Shop' },
            description: { ar: 'محلات تجارية', en: 'Commercial Shops' },
            icon: 'fas fa-store',
            properties_source: 'custom',
            is_visible: true
        }
    ];

    // Create main categories
    for (const categoryData of mainCategories) {
        try {
            const response = await authApi.post('/admin/categories', categoryData);
            if (response.data?.data) {
                categories.push(response.data.data);
                console.log(`    ✅ Created category: ${categoryData.name.ar}`);
            }
        } catch (error) {
            console.log(`    ⚠️ Category ${categoryData.name.ar} might already exist`);
        }
    }

    console.log('  🏗️ Creating subcategories...');

    // Create subcategories for apartments
    if (categories.length > 0) {
        const apartmentSubcats = [
            {
                name: { ar: 'شقة استوديو', en: 'Studio Apartment' },
                description: { ar: 'شقة استوديو', en: 'Studio Apartment' },
                icon: 'fas fa-home',
                parent_id: categories[0].id,
                properties_source: 'parent_and_custom',
                is_visible: true
            },
            {
                name: { ar: 'شقة غرفتين', en: '2 Bedroom Apartment' },
                description: { ar: 'شقة غرفتين', en: '2 Bedroom Apartment' },
                icon: 'fas fa-home',
                parent_id: categories[0].id,
                properties_source: 'parent_and_custom',
                is_visible: true
            }
        ];

        for (const subcat of apartmentSubcats) {
            try {
                const response = await authApi.post('/admin/categories', subcat);
                if (response.data?.data) {
                    categories.push(response.data.data);
                    console.log(`    ✅ Created subcategory: ${subcat.name.ar}`);
                }
            } catch (error) {
                console.log(`    ⚠️ Subcategory ${subcat.name.ar} might already exist`);
            }
        }
    }

    console.log('  🔧 Creating properties...');
    await createProperties(authApi, categories);

    console.log('  ⭐ Creating features...');
    await createFeatures(authApi, categories);

    return categories;
}

/**
 * Create properties for categories
 */
async function createProperties(api: ApiInstance, categories: Category[]): Promise<void> {
    const properties = [
        // Common properties for all categories
        {
            category_id: categories[0]?.id,
            name: { ar: 'عدد الغرف', en: 'Number of Rooms' },
            description: { ar: 'عدد الغرف', en: 'Number of Rooms' },
            icon: 'fas fa-bed',
            type: 'int',
            is_filter: true,
            options: [1, 2, 3, 4, 5, 6]
        },
        {
            category_id: categories[0]?.id,
            name: { ar: 'عدد الحمامات', en: 'Number of Bathrooms' },
            description: { ar: 'عدد الحمامات', en: 'Number of Bathrooms' },
            icon: 'fas fa-bath',
            type: 'int',
            is_filter: true,
            options: [1, 2, 3, 4]
        },
        {
            category_id: categories[0]?.id,
            name: { ar: 'المساحة', en: 'Area' },
            description: { ar: 'المساحة بالمتر المربع', en: 'Area in Square Meters' },
            icon: 'fas fa-ruler-combined',
            type: 'float',
            is_filter: true
        },
        {
            category_id: categories[0]?.id,
            name: { ar: 'الطابق', en: 'Floor' },
            description: { ar: 'رقم الطابق', en: 'Floor Number' },
            icon: 'fas fa-layer-group',
            type: 'int',
            is_filter: true,
            options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        },
        {
            category_id: categories[0]?.id,
            name: { ar: 'حالة الأثاث', en: 'Furniture Status' },
            description: { ar: 'حالة أثاث العقار', en: 'Property Furniture Status' },
            icon: 'fas fa-couch',
            type: 'enum',
            is_filter: true,
            options: ['مفروش', 'غير مفروش', 'نصف مفروش']
        }
    ];

    for (const property of properties) {
        if (property.category_id) {
            try {
                await api.post('/admin/properties', property);
                console.log(`    ✅ Created property: ${property.name.ar}`);
            } catch (error) {
                console.log(`    ⚠️ Property ${property.name.ar} might already exist`);
            }
        }
    }
}

/**
 * Create features for categories
 */
async function createFeatures(api: ApiInstance, categories: Category[]): Promise<void> {
    const features = [
        {
            category_id: categories[0]?.id,
            name: { ar: 'مسبح', en: 'Swimming Pool' },
            description: { ar: 'يحتوي على مسبح', en: 'Has swimming pool' },
            icon: 'fas fa-swimmer'
        },
        {
            category_id: categories[0]?.id,
            name: { ar: 'حديقة', en: 'Garden' },
            description: { ar: 'يحتوي على حديقة', en: 'Has garden' },
            icon: 'fas fa-seedling'
        },
        {
            category_id: categories[0]?.id,
            name: { ar: 'مصعد', en: 'Elevator' },
            description: { ar: 'يحتوي على مصعد', en: 'Has elevator' },
            icon: 'fas fa-elevator'
        },
        {
            category_id: categories[0]?.id,
            name: { ar: 'مواقف سيارات', en: 'Parking' },
            description: { ar: 'مواقف سيارات', en: 'Parking spaces' },
            icon: 'fas fa-car'
        },
        {
            category_id: categories[0]?.id,
            name: { ar: 'تكييف مركزي', en: 'Central AC' },
            description: { ar: 'تكييف مركزي', en: 'Central air conditioning' },
            icon: 'fas fa-snowflake'
        },
        {
            category_id: categories[0]?.id,
            name: { ar: 'أمن 24/7', en: '24/7 Security' },
            description: { ar: 'أمن على مدار الساعة', en: '24/7 security' },
            icon: 'fas fa-shield-alt'
        },
        {
            category_id: categories[0]?.id,
            name: { ar: 'شرفة', en: 'Balcony' },
            description: { ar: 'شرفة أو تراس', en: 'Balcony or terrace' },
            icon: 'fas fa-home'
        },
        {
            category_id: categories[0]?.id,
            name: { ar: 'مشمس', en: 'Sunny' },
            description: { ar: 'معرض للشمس', en: 'Sunny exposure' },
            icon: 'fas fa-sun'
        }
    ];

    for (const feature of features) {
        if (feature.category_id) {
            try {
                await api.post('/admin/features', feature);
                console.log(`    ✅ Created feature: ${feature.name.ar}`);
            } catch (error) {
                console.log(`    ⚠️ Feature ${feature.name.ar} might already exist`);
            }
        }
    }
}
