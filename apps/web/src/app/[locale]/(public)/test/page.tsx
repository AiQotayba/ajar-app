"use client";

import { useState, useEffect } from 'react';
import { MapPin, Eye, Heart, Share2, Phone, Calendar, CheckCircle2 } from 'lucide-react';

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SY').format(price);
};

const ListingCard = ({ listing }: { listing: any }) => {
    // Get the best image available and ensure it has the full URL
    let imageUrl = listing.images?.[0]?.full_url || listing.cover_image;
    if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `https://backend.ajarsyria.com/storage/${imageUrl}`;
    }

    const isRent = listing.type === 'rent';

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full">
            {/* Image Container */}
            <div className="relative h-64 overflow-hidden">
                <img
                    src={imageUrl}
                    alt={listing.title.ar}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e: any) => {
                        e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // Fallback image
                    }}
                />

                {/* Top Badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-bold shadow-md ${isRent ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'}`}>
                        {isRent ? 'للإيجار' : 'للبيع'}
                    </span>
                    {listing.category?.name?.ar && (
                        <span className="bg-white/90 backdrop-blur text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
                            {listing.category.name.ar}
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <button className="bg-white/80 hover:bg-white p-2 rounded-full text-gray-600 hover:text-red-500 transition-colors shadow-sm">
                        <Heart size={20} />
                    </button>
                    <button className="bg-white/80 hover:bg-white p-2 rounded-full text-gray-600 hover:text-blue-500 transition-colors shadow-sm">
                        <Share2 size={20} />
                    </button>
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-4 right-4 bg-gray-900/80 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-white/20 shadow-lg">
                    <span className="text-2xl font-bold">{formatPrice(listing.price)}</span>
                    <span className="text-sm ml-1 opacity-80">{listing.currency}</span>
                    {isRent && <span className="text-sm opacity-80 mr-1">/ شهر</span>}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                {/* Title & Location */}
                <div className="mb-4 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {listing.title?.ar || 'بدون عنوان'}
                    </h3>
                    <div className="flex items-center text-gray-500 text-sm">
                        <MapPin size={16} className="ml-1 text-gray-400" />
                        <span>{listing.governorate?.name?.ar || 'غير محدد'}</span>
                    </div>
                </div>

                {/* Description snippet */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {listing.description?.ar || ''}
                </p>

                {/* Features (limit to 3) */}
                {listing.features && listing.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 pt-4 border-t border-gray-100">
                        {listing.features.slice(0, 3).map((feature: any, idx: number) => (
                            <div key={idx} className="flex items-center bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                {feature.icon ? (
                                    <img src={feature.icon} alt="icon" className="w-4 h-4 ml-1.5 opacity-70" />
                                ) : (
                                    <CheckCircle2 size={14} className="ml-1.5 text-blue-500" />
                                )}
                                <span className="text-xs text-gray-600">{feature.name.ar}</span>
                            </div>
                        ))}
                        {listing.features.length > 3 && (
                            <div className="flex items-center bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 text-xs text-gray-500">
                                +{listing.features.length - 3} المزيد
                            </div>
                        )}
                    </div>
                )}

                {/* Footer info */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-xs">
                        <Eye size={14} className="ml-1" />
                        <span>{listing.views_count} مشاهدة</span>
                    </div>

                    {listing.owner ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">{listing.owner.full_name}</span>
                            <img
                                src={listing.owner.avatar_url}
                                alt={listing.owner.full_name}
                                className="w-8 h-8 rounded-full border border-gray-200"
                            />
                        </div>
                    ) : (
                        <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            إدارة المنصة
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const response = await fetch('https://backend.ajarsyria.com/api/v1/user/listings?status=approved&page=1&per_page=5');
                const result = await response.json();

                if (result.success) {
                    setListings(result.data);
                } else {
                    setError('فشل في جلب البيانات من الخادم.');
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة لاحقاً.');
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50 font-sans text-right pb-12">

            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">أحدث الإعلانات</h2>
                        <p className="text-gray-500">تصفح أحدث العقارات والسيارات المضافة حديثاً</p>
                    </div>
                    <button className="hidden sm:block text-blue-600 font-medium hover:underline">
                        عرض الكل ←
                    </button>
                </div>

                {error ? (
                    // Error Message
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center font-medium">
                        {error}
                    </div>
                ) : loading ? (
                    // Loading Skeleton
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="bg-white rounded-2xl h-96 animate-pulse p-4 border border-gray-100">
                                <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                                <div className="h-10 bg-gray-200 rounded-xl w-full mt-auto"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Listings Grid
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map((listing: any) => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}