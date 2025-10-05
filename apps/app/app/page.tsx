import { CategoryFilter } from "@/components/filters/category-filter"
import { HeroSlider } from "@/components/home/hero-slider"
import { Header } from "@/components/layout/header"
import { ListingGrid } from "@/components/listings/listing-grid"
import { SearchBar } from "@/components/search/search-bar"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="الرئيسية" showNotification />

      <main className="space-y-6">
        {/* Search Section */}
        <div className="px-4 pt-4">
          <SearchBar />
        </div>

        {/* Hero Slider */}
        <HeroSlider />

        {/* Category Filter */}
        <CategoryFilter />

        {/* Listings */}
        <div className="px-4">
          <ListingGrid />
        </div>
      </main>
    </div>
  )
}
