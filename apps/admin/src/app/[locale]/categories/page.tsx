import { Link } from '@/lib/i18n/routing';
import { getTranslations } from 'next-intl/server';

export default async function CategoriesPage() {
  const t = await getTranslations('navigation');

  const categories = [
    {
      id: 1,
      name: "Apartments",
      nameAr: "شقق",
      description: "Modern apartments for rent and sale",
      descriptionAr: "شقق حديثة للإيجار والبيع",
      icon: "🏢",
      count: 245,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: 2,
      name: "Villas",
      nameAr: "فيلات",
      description: "Luxury villas with gardens",
      descriptionAr: "فيلات فاخرة مع حدائق",
      icon: "🏡",
      count: 89,
      color: "bg-green-100 text-green-600"
    },
    {
      id: 3,
      name: "Offices",
      nameAr: "مكاتب",
      description: "Commercial office spaces",
      descriptionAr: "مساحات مكتبية تجارية",
      icon: "🏢",
      count: 67,
      color: "bg-purple-100 text-purple-600"
    },
    {
      id: 4,
      name: "Shops",
      nameAr: "محلات",
      description: "Retail shops and stores",
      descriptionAr: "محلات تجارية ومتاجر",
      icon: "🏪",
      count: 123,
      color: "bg-orange-100 text-orange-600"
    },
    {
      id: 5,
      name: "Land",
      nameAr: "أراضي",
      description: "Residential and commercial land",
      descriptionAr: "أراضي سكنية وتجارية",
      icon: "🌍",
      count: 45,
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      id: 6,
      name: "Warehouses",
      nameAr: "مستودعات",
      description: "Storage and warehouse spaces",
      descriptionAr: "مساحات تخزين ومستودعات",
      icon: "🏭",
      count: 34,
      color: "bg-gray-100 text-gray-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('categories')}
          </h1>
          <p className="text-gray-600">
            Browse properties by category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 group"
            >
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-2xl mr-4`}>
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {category.count} properties
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">
                {category.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-medium group-hover:text-blue-700">
                  View Properties →
                </span>
                <div className="text-sm text-gray-500">
                  {category.count} available
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Categories</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">🏢</span>
                <div>
                  <h3 className="text-2xl font-bold">Apartments</h3>
                  <p className="text-blue-100">245 properties available</p>
                </div>
              </div>
              <p className="text-blue-100 mb-6">
                Find your perfect apartment in the heart of the city with modern amenities and great locations.
              </p>
              <Link 
                href="/categories/1"
                className="bg-white text-blue-600 px-6 py-2 rounded-md hover:bg-gray-100 transition-colors inline-block"
              >
                Browse Apartments
              </Link>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg p-8">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">🏡</span>
                <div>
                  <h3 className="text-2xl font-bold">Villas</h3>
                  <p className="text-green-100">89 properties available</p>
                </div>
              </div>
              <p className="text-green-100 mb-6">
                Discover luxury villas with gardens, pools, and premium locations for the ultimate living experience.
              </p>
              <Link 
                href="/categories/2"
                className="bg-white text-green-600 px-6 py-2 rounded-md hover:bg-gray-100 transition-colors inline-block"
              >
                Browse Villas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
