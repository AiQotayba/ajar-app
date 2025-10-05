"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { X } from "lucide-react"
import { useState } from "react"

interface FilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FilterDrawer({ open, onOpenChange }: FilterDrawerProps) {
  const [propertyType, setPropertyType] = useState("بيع")
  const [propertyCategory, setPropertyCategory] = useState("فيلا")
  const [province, setProvince] = useState("حلب")
  const [city, setCity] = useState("إعزاز")
  const [priceFrom, setPriceFrom] = useState("")
  const [priceTo, setPriceTo] = useState("")
  const [areaFrom, setAreaFrom] = useState("")
  const [areaTo, setAreaTo] = useState("")
  const [rooms, setRooms] = useState("5")
  const [furnished, setFurnished] = useState("furnished")

  const handleReset = () => {
    setPropertyType("بيع")
    setPropertyCategory("فيلا")
    setProvince("حلب")
    setCity("إعزاز")
    setPriceFrom("")
    setPriceTo("")
    setAreaFrom("")
    setAreaTo("")
    setRooms("")
    setFurnished("furnished")
  }

  const handleApply = () => {
    // Apply filters logic here
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 max-w-lg mx-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold">فلترة حسب</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-10 w-10 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="w-16 h-1 bg-border rounded-full mx-auto mt-2" />
          </SheetHeader>

          {/* Filters Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Property Type and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">العقار</Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="h-12 rounded-xl bg-primary/5 border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="بيع">بيع</SelectItem>
                    <SelectItem value="إيجار">إيجار</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">نوع العقار</Label>
                <Select value={propertyCategory} onValueChange={setPropertyCategory}>
                  <SelectTrigger className="h-12 rounded-xl bg-primary/5 border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="فيلا">فيلا</SelectItem>
                    <SelectItem value="شقة">شقة</SelectItem>
                    <SelectItem value="بيت">بيت</SelectItem>
                    <SelectItem value="مكتب">مكتب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Province and City */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">المحافظة</Label>
                <Select value={province} onValueChange={setProvince}>
                  <SelectTrigger className="h-12 rounded-xl bg-primary/5 border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="حلب">حلب</SelectItem>
                    <SelectItem value="دمشق">دمشق</SelectItem>
                    <SelectItem value="حمص">حمص</SelectItem>
                    <SelectItem value="إدلب">إدلب</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">المدينة</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="h-12 rounded-xl bg-primary/5 border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="إعزاز">إعزاز</SelectItem>
                    <SelectItem value="الباب">الباب</SelectItem>
                    <SelectItem value="جرابلس">جرابلس</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">السعر(شهريا)</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="من"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  className="h-12 rounded-xl bg-background border-border"
                />
                <Input
                  type="number"
                  placeholder="إلى"
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                  className="h-12 rounded-xl bg-background border-border"
                />
              </div>
            </div>

            {/* Area Range */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">المساحة</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="من"
                  value={areaFrom}
                  onChange={(e) => setAreaFrom(e.target.value)}
                  className="h-12 rounded-xl bg-background border-border"
                />
                <Input
                  type="number"
                  placeholder="إلى"
                  value={areaTo}
                  onChange={(e) => setAreaTo(e.target.value)}
                  className="h-12 rounded-xl bg-background border-border"
                />
              </div>
            </div>

            {/* Number of Rooms */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">عدد الغرف</Label>
              <Input
                type="number"
                placeholder="5"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                className="h-12 rounded-xl bg-background border-border"
              />
            </div>

            {/* Furnished Status */}
            <div className="space-y-3">
              <RadioGroup value={furnished} onValueChange={setFurnished} className="flex gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <RadioGroupItem
                    value="furnished"
                    id="furnished"
                    className="border-primary data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="furnished" className="text-base font-medium cursor-pointer">
                    مفروش
                  </Label>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <RadioGroupItem value="unfurnished" id="unfurnished" className="border-border" />
                  <Label htmlFor="unfurnished" className="text-base font-medium cursor-pointer">
                    غير مفروش
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-6 border-t bg-background grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="h-14 rounded-2xl text-base font-semibold bg-transparent"
            >
              إعادة تعيين
            </Button>
            <Button onClick={handleApply} className="h-14 rounded-2xl text-base font-semibold">
              تطبيق الفلترة
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
