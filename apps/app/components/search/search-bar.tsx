"use client"

import { FilterDrawer } from "@/components/filters/filter-drawer"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import { useState } from "react"

export function SearchBar() {
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-3 bg-primary/20 rounded-2xl w-full lg:max-w-lg mx-auto">
        <div className="flex flex-row w-full  relative">
          <IconSearch />
          <input
            type="text"
            placeholder="ابحث عن عقار، موقع، أو مدينة..."
            className="focus:border-primary focus:outline-none h-14 pr-14 placeholder:text-primary/80 px-5 transition-all w-full"
          />
        </div>

        <Button
          size="icon"
          variant="transparent"
          onClick={() => setFilterOpen(true)}
          className="h-14 w-14 !p-0 !m-0 transition-all"
        >
          <SlidersHorizontal className="h-14 w-14 text-primary" />
        </Button>
      </div>

      <FilterDrawer open={filterOpen} onOpenChange={setFilterOpen} />
    </>
  )
}

const IconSearch = () => {
  return (
    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-primary">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 19.75C8.07164 19.75 6.18657 19.1782 4.58319 18.1068C2.97982 17.0355 1.73013 15.5127 0.992179 13.7312C0.254224 11.9496 0.061142 9.98919 0.437348 8.09787C0.813554 6.20656 1.74215 4.46927 3.10571 3.10571C4.46927 1.74215 6.20656 0.813554 8.09787 0.437348C9.98919 0.061142 11.9496 0.254224 13.7312 0.992179C15.5127 1.73013 17.0355 2.97982 18.1068 4.58319C19.1782 6.18657 19.75 8.07164 19.75 10C19.7484 12.5854 18.7207 15.0644 16.8925 16.8925C15.0644 18.7207 12.5854 19.7484 10 19.75ZM10 1.75C8.36831 1.75 6.77326 2.23386 5.41655 3.14038C4.05984 4.0469 3.00242 5.33538 2.378 6.84287C1.75358 8.35036 1.5902 10.0092 1.90853 11.6095C2.22685 13.2098 3.01259 14.6799 4.16637 15.8336C5.32016 16.9874 6.79017 17.7732 8.39051 18.0915C9.99085 18.4098 11.6497 18.2464 13.1571 17.622C14.6646 16.9976 15.9531 15.9402 16.8596 14.5835C17.7661 13.2268 18.25 11.6317 18.25 10C18.2479 7.81262 17.378 5.71543 15.8313 4.16871C14.2846 2.622 12.1874 1.75212 10 1.75Z" fill="#67B39F" />
        <path d="M19.16 21.79C19.083 21.7887 19.0061 21.7821 18.93 21.77C18.46 21.71 17.61 21.39 17.13 19.96C17.0029 19.6201 16.9593 19.2547 17.0028 18.8945C17.0463 18.5343 17.1756 18.1898 17.38 17.89C17.6009 17.6013 17.8878 17.3697 18.2166 17.2149C18.5455 17.06 18.9067 16.9863 19.27 17C19.6977 16.9608 20.1279 17.041 20.5128 17.2316C20.8976 17.4223 21.2221 17.716 21.45 18.08C21.6242 18.4732 21.6875 18.9067 21.6328 19.3333C21.5782 19.7599 21.4077 20.1634 21.14 20.5C20.9488 20.8672 20.6661 21.1788 20.3193 21.4048C19.9724 21.6308 19.5731 21.7635 19.16 21.79ZM18.56 19.49C18.73 20.01 18.97 20.27 19.13 20.29C19.29 20.31 19.59 20.12 19.9 19.67C20.19 19.24 20.21 18.93 20.14 18.79C20.07 18.65 19.79 18.5 19.27 18.5C19.145 18.4899 19.0194 18.509 18.9031 18.5558C18.7868 18.6027 18.683 18.676 18.6 18.77C18.5374 18.8785 18.5012 19.0002 18.4943 19.1252C18.4873 19.2503 18.5098 19.3752 18.56 19.49Z" fill="#67B39F" />
      </svg>

    </div>
  )
}