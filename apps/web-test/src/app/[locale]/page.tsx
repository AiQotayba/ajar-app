import { Link } from '@/lib/i18n/routing';
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
    const t = await getTranslations('common');

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-6">
                        {t('search')}
                    </h1>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Find your perfect property with our comprehensive real estate platform
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/listings"
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Browse Properties
                        </Link>
                        <Link
                            href="/auth/register"
                            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Why Choose Ajar?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🏠</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                Find Properties
                            </h3>
                            <p className="text-gray-600">
                                Search and discover the perfect property for you with our advanced filtering system
                            </p>
                        </div>

                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📱</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                Easy Management
                            </h3>
                            <p className="text-gray-600">
                                Manage your listings and favorites with ease using our intuitive interface
                            </p>
                        </div>

                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🌍</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                Multi-Language
                            </h3>
                            <p className="text-gray-600">
                                Available in Arabic and English with full RTL support
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-gray-100 py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
                            <div className="text-gray-600">Properties Listed</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                            <div className="text-gray-600">Happy Customers</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                            <div className="text-gray-600">Cities Covered</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                            <div className="text-gray-600">Customer Support</div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
