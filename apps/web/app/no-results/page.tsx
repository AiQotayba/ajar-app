import { CategoryFilter } from "@/components/filters/category-filter"
import { Header } from "@/components/layout/header"
import { SearchBar } from "@/components/search/search-bar"
import { NoResults } from "@/components/states/no-results"

export default function NoResultsPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="نتائج البحث" showBack />

      <main className="px-4 pt-4 space-y-4">
        <SearchBar />
        <CategoryFilter />
        <NoResults />
      </main> 
    </div>
  )
}
