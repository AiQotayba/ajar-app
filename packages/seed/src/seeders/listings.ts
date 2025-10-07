import type { ApiInstance } from '@useApi';

interface Category {
    id: number;
    name: { ar: string; en: string };
}

interface Location {
    governorates: Array<{ id: number; name: { ar: string; en: string } }>;
    cities: Array<{ id: number; governorate_id: number; name: { ar: string; en: string } }>;
}

/**
 * Create 50 listings covering all scenarios
 */
export async function createListings(
    api: ApiInstance,
    adminToken: string,
    categories: Category[],
    locations: Location
): Promise<void> {

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

    console.log('  🏠 Creating 50 listings with all scenarios...');

    const listingsData = generateListingsData(categories, locations);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < listingsData.length; i++) {
        const listing = listingsData[i];

        try {
            const response = await authApi.post('/admin/listings', {
                owner_id: 1, // Admin user
                ...listing
            });

            if (response.data?.data) {
                successCount++;
                console.log(`    ✅ Created listing ${i + 1}/50: ${listing.title.ar}`);
            }
        } catch (error) {
            errorCount++;
            console.log(`    ❌ Failed to create listing ${i + 1}/50: ${listing.title.ar}`);
        }

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`  📊 Listings created: ${successCount} successful, ${errorCount} failed`);
}

/**
 * Generate 50 listings data covering all scenarios
 */
function generateListingsData(categories: Category[], locations: Location): any[] {
    const listings = [];

    // Sample data for different scenarios
    const apartments = [
        { ar: 'شقة فاخرة في الجبيهة', en: 'Luxury Apartment in Jubaiha' },
        { ar: 'شقة عائلية في الشميساني', en: 'Family Apartment in Shmeisani' },
        { ar: 'استوديو حديث في الدوار السابع', en: 'Modern Studio in Dawar Al-Sabi' },
        { ar: 'شقة مفروشة بالكامل', en: 'Fully Furnished Apartment' },
        { ar: 'شقة مع إطلالة رائعة', en: 'Apartment with Amazing View' }
    ];

    const villas = [
        { ar: 'فيلا فاخرة مع مسبح', en: 'Luxury Villa with Pool' },
        { ar: 'فيلا عائلية كبيرة', en: 'Large Family Villa' },
        { ar: 'فيلا حديثة في مجمع سكني', en: 'Modern Villa in Residential Complex' },
        { ar: 'فيلا مع حديقة واسعة', en: 'Villa with Large Garden' },
        { ar: 'فيلا للبيع بسرعة', en: 'Villa for Quick Sale' }
    ];

    const lands = [
        { ar: 'قطعة أرض سكنية', en: 'Residential Land Plot' },
        { ar: 'أرض تجارية في موقع مميز', en: 'Commercial Land in Prime Location' },
        { ar: 'قطعة أرض للاستثمار', en: 'Investment Land Plot' },
        { ar: 'أرض زراعية', en: 'Agricultural Land' },
        { ar: 'أرض صناعية', en: 'Industrial Land' }
    ];

    const offices = [
        { ar: 'مكتب تجاري في الطابق الأول', en: 'Ground Floor Commercial Office' },
        { ar: 'مكتب في برج تجاري', en: 'Office in Commercial Tower' },
        { ar: 'مكتب مع مواقف سيارات', en: 'Office with Parking' },
        { ar: 'مكتب مفروش', en: 'Furnished Office' },
        { ar: 'مكتب صغير للإيجار', en: 'Small Office for Rent' }
    ];

    const shops = [
        { ar: 'محل تجاري في شارع رئيسي', en: 'Shop on Main Street' },
        { ar: 'محل في مجمع تجاري', en: 'Shop in Commercial Complex' },
        { ar: 'محل صغير للإيجار', en: 'Small Shop for Rent' },
        { ar: 'محل مع مستودع', en: 'Shop with Warehouse' },
        { ar: 'محل في موقع مميز', en: 'Shop in Prime Location' }
    ];

    const allListings = [
        ...apartments.map(title => ({ ...title, category: 'apartment', type: 'rent' })),
        ...apartments.map(title => ({ ...title, category: 'apartment', type: 'sale' })),
        ...villas.map(title => ({ ...title, category: 'villa', type: 'sale' })),
        ...villas.map(title => ({ ...title, category: 'villa', type: 'rent' })),
        ...lands.map(title => ({ ...title, category: 'land', type: 'sale' })),
        ...offices.map(title => ({ ...title, category: 'office', type: 'rent' })),
        ...offices.map(title => ({ ...title, category: 'office', type: 'sale' })),
        ...shops.map(title => ({ ...title, category: 'shop', type: 'rent' })),
        ...shops.map(title => ({ ...title, category: 'shop', type: 'sale' }))
    ];

    // Generate 50 listings
    for (let i = 0; i < 50; i++) {
        const listingTemplate = allListings[i % allListings.length];
        const category = categories.find(c => c.name.en.toLowerCase().includes(listingTemplate.category)) || categories[0];
        const governorate = locations.governorates[i % locations.governorates.length];
        const city = locations.cities.find(c => c.governorate_id === governorate.id) || locations.cities[0];

        // Different statuses to cover all scenarios
        const statuses = ['draft', 'in_review', 'approved', 'rejected'];
        const availabilityStatuses = ['available', 'unavailable', 'rented', 'sold'];
        const types = ['rent', 'sale'];

        const status = statuses[i % statuses.length];
        const availabilityStatus = availabilityStatuses[i % availabilityStatuses.length];
        const type = types[i % types.length];

        const listing = {
            category_id: category.id,
            title: listingTemplate,
            description: {
                ar: `وصف مفصل للعقار رقم ${i + 1}. ${getDescriptionByCategory(category.name.ar)}`,
                en: `Detailed description for property ${i + 1}. ${getDescriptionByCategory(category.name.en)}`
            },
            price: getRandomPrice(type, category.name.ar),
            currency: 'JOD',
            governorate_id: governorate.id,
            city_id: city.id,
            latitude: getRandomLatitude(governorate.name.en),
            longitude: getRandomLongitude(governorate.name.en),
            type: type,
            availability_status: availabilityStatus,
            status: status,
            is_featured: i < 10, // First 10 are featured
            properties: generateProperties(category.id),
            features: generateFeatures(),
            media: generateMedia(i + 1)
        };

        listings.push(listing);
    }

    return listings;
}

/**
 * Helper functions
 */
function getDescriptionByCategory(categoryName: string): string {
    const descriptions = {
        'شقق': 'شقة جميلة في موقع مميز مع جميع المرافق والخدمات',
        'فيلا': 'فيلا فاخرة مع جميع المميزات والمساحات الواسعة',
        'أرض': 'قطعة أرض في موقع استراتيجي مناسب للاستثمار',
        'مكتب': 'مكتب تجاري في موقع حيوي مع جميع الخدمات',
        'محل': 'محل تجاري في شارع رئيسي مع حركة كبيرة'
    } as Record<string, string>;

    return descriptions[categoryName] ?? 'عقار مميز في موقع رائع';
}

function getRandomPrice(type: string, categoryName: string): number {
    const basePrices = {
        'شقق': { rent: [300, 800], sale: [50000, 150000] },
        'فيلا': { rent: [800, 2000], sale: [100000, 500000] },
        'أرض': { rent: [100, 500], sale: [20000, 200000] },
        'مكتب': { rent: [400, 1200], sale: [80000, 300000] },
        'محل': { rent: [300, 1000], sale: [60000, 250000] }
    };

    const prices = basePrices[categoryName as keyof typeof basePrices] || basePrices['شقق'];
    const [min, max] = prices[type as keyof typeof prices];

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomLatitude(governorate: string): string {
    const coordinates = {
        'Amman': (31.9 + Math.random() * 0.2).toFixed(6),
        'Zarqa': (32.0 + Math.random() * 0.1).toFixed(6),
        'Irbid': (32.5 + Math.random() * 0.1).toFixed(6),
        'Aqaba': (29.5 + Math.random() * 0.1).toFixed(6),
        'Balqa': (32.0 + Math.random() * 0.2).toFixed(6)
    };

    return coordinates[governorate as keyof typeof coordinates] || '31.9454';
}

function getRandomLongitude(governorate: string): string {
    const coordinates = {
        'Amman': (35.9 + Math.random() * 0.2).toFixed(6),
        'Zarqa': (36.0 + Math.random() * 0.1).toFixed(6),
        'Irbid': (35.8 + Math.random() * 0.1).toFixed(6),
        'Aqaba': (35.0 + Math.random() * 0.1).toFixed(6),
        'Balqa': (35.7 + Math.random() * 0.2).toFixed(6)
    };

    return coordinates[governorate as keyof typeof coordinates] || '35.9284';
}

function generateProperties(categoryId: number): any[] {
    return [
        {
            property_id: 1, // Number of rooms
            value: (Math.floor(Math.random() * 5) + 1).toString(),
            sort_order: 1
        },
        {
            property_id: 2, // Number of bathrooms
            value: (Math.floor(Math.random() * 3) + 1).toString(),
            sort_order: 2
        },
        {
            property_id: 3, // Area
            value: (Math.floor(Math.random() * 200) + 50).toString(),
            sort_order: 3
        }
    ];
}

function generateFeatures(): number[] {
    const featureCount = Math.floor(Math.random() * 4) + 1;
    const features = [];

    for (let i = 0; i < featureCount; i++) {
        features.push(i + 1);
    }

    return features;
}

function generateMedia(listingNumber: number): any[] {
    const media = [];
    const imageCount = Math.floor(Math.random() * 3) + 3; // 3-5 images

    for (let i = 0; i < imageCount; i++) {
        media.push({
            type: 'image',
            url: `listings/listing_${listingNumber}_image_${i + 1}.jpg`,
            source: 'file',
            sort_order: i + 1
        });
    }

    return media;
}
