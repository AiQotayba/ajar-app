import { ListingCard } from "./listing-card"

const listings = [
  {
    id: 1,
    image: "/luxury-modern-house-exterior-wooden-deck.jpg",
    title: "شقة عائلية واسعة ومفروشة بالكامل للإيجار بموقع مركزي",
    description: "قريب من المدارس والأسواق.",
    price: "400",
    period: "دفع 6 أشهر",
    location: "مدينة إدلب",
    bedrooms: 5,
    furnished: true,
    deposit: "$200",
    badge: "مؤجر",
    badgeType: "rent" as const,
    isFavorite: true,
  },
  {
    id: 2,
    image: "/white-traditional-house-with-porch.jpg",
    title: "شقة عائلية واسعة ومفروشة بالكامل للإيجار بموقع مركزي",
    description: "قريب من المدارس والأسواق.",
    price: "14000",
    location: "مدينة إدلب",
    bedrooms: 5,
    furnished: false,
    badge: "بيع",
    badgeType: "rent" as const,
  },
  {
    id: 3,
    image: "/modern-white-villa-with-pool.jpg",
    title: "شقة عائلية واسعة ومفروشة بالكامل للإيجار بموقع مركزي",
    description: "قريب من المدارس والأسواق.",
    price: "500",
    period: "دفع 3 أشهر",
    location: "مدينة إدلب",
    bedrooms: 5,
    furnished: true,
    deposit: "$150",
    badge: "مميز",
    badgeType: "featured" as const,
    safe_home: "200$",
    isFavorite: false,
  },
  {
    id: 4,
    image: "/luxury-modern-house-exterior-wooden-deck.jpg",
    title: "شقة عائلية واسعة ومفروشة بالكامل للإيجار بموقع مركزي",
    description: "قريب من المدارس والأسواق.",
    price: "400",
    period: "دفع 6 أشهر",
    location: "مدينة إدلب",
    bedrooms: 5,
    furnished: true,
    deposit: "$200",
    badge: "مؤجر",
    badgeType: "rent" as const,
    isFavorite: true,
  },
  {
    id: 5,
    image: "/white-traditional-house-with-porch.jpg",
    title: "شقة عائلية واسعة ومفروشة بالكامل للإيجار بموقع مركزي",
    description: "قريب من المدارس والأسواق.",
    price: "14000",
    location: "مدينة إدلب",
    bedrooms: 5,
    furnished: false,
    badge: "بيع",
    badgeType: "rent" as const,
  },
]

export function ListingGrid({ data }: any) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center">
      {data?.map((listing: any) => (
        <div key={listing.id} className="w-full mx-auto">
          <ListingCard listing={listing} />
        </div>
      ))}
    </div>
  )
}
