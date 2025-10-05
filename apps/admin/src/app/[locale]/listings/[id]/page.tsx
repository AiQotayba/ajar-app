import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

interface ListingPageProps {
  params: {
    id: string;
    locale: string;
  };
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const t = await getTranslations('listing');
  
  // In a real app, you would fetch the listing data here
  const listingId = params.id;
  
  // Mock data for now
  const listing = {
    id: listingId,
    title: "Beautiful Villa in Amman",
    description: "A stunning 4-bedroom villa with modern amenities, located in a prime area of Amman. Perfect for families looking for comfort and luxury.",
    price: 250000,
    currency: "JOD",
    type: "sale",
    location: "Amman, Jordan",
    bedrooms: 4,
    bathrooms: 3,
    area: 250,
    features: ["Swimming Pool", "Garden", "Parking", "Security"],
    images: Array.from({ length: 5 }, (_, i) => `/images/property-${i + 1}.jpg`),
    owner: {
      name: "Ahmed Al-Rashid",
      phone: "+962791234567",
      email: "ahmed@example.com"
    }
  };

  if (!listing) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><a href="/" className="hover:text-blue-600">Home</a></li>
            <li>/</li>
            <li><a href="/listings" className="hover:text-blue-600">Listings</a></li>
            <li>/</li>
            <li className="text-gray-900">{listing.title}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Main Image</span>
                  </div>
                </div>
                {listing.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Image {index + 2}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{listing.title}</h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-blue-600">
                  {listing.price.toLocaleString()} {listing.currency}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {listing.type === 'sale' ? 'For Sale' : 'For Rent'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{listing.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{listing.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{listing.area}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">1</div>
                  <div className="text-sm text-gray-600">Parking</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {listing.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Contact Owner</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Owner</div>
                  <div className="font-medium">{listing.owner.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Phone</div>
                  <div className="font-medium">{listing.owner.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Email</div>
                  <div className="font-medium">{listing.owner.email}</div>
                </div>
                <div className="pt-4 space-y-2">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                    Call Now
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors">
                    Send Message
                  </button>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Location</h3>
              <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Map View</span>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                {listing.location}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
