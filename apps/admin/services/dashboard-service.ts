import { DashboardData } from '../types/dashboard';

export const getDashboardData = (): DashboardData => {
    return {
        notifications: [
            {
                id: '1',
                title: 'إعلان جديد',
                description: 'تم إضافة إعلان جديد "شقة في المعادي"',
                timestamp: new Date().toISOString(),
                read: false,
            },
            {
                id: '2',
                title: 'مستخدم جديد',
                description: 'سجل محمد أحمد في المنصة',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                read: true,
            }
        ],
        users: [
            {
                id: 'u1',
                name: 'أحمد محمد علي',
                email: 'ahmed@example.com',
                joinedAt: 'منذ يوم',
                status: 'active'
            },
            {
                id: 'u2',
                name: 'فاطمة حسن',
                email: 'fatima@example.com',
                joinedAt: 'منذ يومين',
                status: 'active'
            },
            {
                id: 'u3',
                name: 'محمود خالد',
                email: 'mahmoud@example.com',
                joinedAt: 'منذ 3 أيام',
                status: 'active'
            }
        ],
        listingsPublished: [
            {
                id: 'l2',
                title: 'شقة مفروشة في الدوار الرابع',
                location: 'الدوار الرابع',
                price: 12000,
                currency: 'EGP',
                status: 'published',
                publishedAt: 'منذ ساعتين',
            },
            {
                id: 'l4',
                title: 'محل تجاري في وسط البلد',
                location: 'وسط البلد',
                price: 45000,
                currency: 'EGP',
                status: 'published',
                publishedAt: 'منذ 5 ساعات',
            }
        ],
        listingsPending: [
            {
                id: 'l1',
                title: 'فيلا فاخرة للبيع في عمان',
                location: 'عمان',
                price: 5000000,
                currency: 'EGP',
                status: 'pending',
                publishedAt: 'منذ ساعة',
            },
            {
                id: 'l3',
                title: 'أرض سكنية في الجبيهة',
                location: 'الجبيهة',
                price: 250000,
                currency: 'EGP',
                status: 'pending',
                publishedAt: 'منذ 3 ساعات',
            }
        ],
        reviews: [
            {
                id: 'r1',
                userId: 'u5',
                userName: 'خالد مصطفى',
                listingId: 'l2',
                listingTitle: 'شقة مفروشة في الدوار الرابع',
                rating: 5,
                comment: 'مكان ممتاز وخدمة رائعة',
                createdAt: 'منذ يومين'
            }
        ],
        counts: {
            listingsAll: 258,
            listingsPublished: 245,
            listingsDraft: 5,
            users: 1248,
            reviews: 156,
            sliders: 4,
            categories: 12,
            features: 45,
            locations: 7,
            reviewsAverage: 4.8
        },
        graph: {
            listings: [
                { month: "يناير", count: 12 },
                { month: "فبراير", count: 19 },
                { month: "مارس", count: 3 },
            ],
            users: [
                { month: "يناير", count: 50 },
                { month: "فبراير", count: 80 },
                { month: "مارس", count: 120 },
            ],
            reviews: [
                { month: "يناير", count: 10 },
                { month: "فبراير", count: 15 },
                { month: "مارس", count: 25 },
            ]
        },
        view: {
            totalViews: 54321,
            dailyViews: [
                { month: "السبت", count: 120 },
                { month: "الأحد", count: 150 },
            ]
        }
    };
}
