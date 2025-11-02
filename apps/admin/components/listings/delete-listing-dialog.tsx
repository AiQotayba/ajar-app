"use client"

import { Trash2Icon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Listing } from "@/lib/types/listing"

interface DeleteListingDialogProps {
  listing: Listing | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteListingDialog({ listing, open, onOpenChange, onConfirm }: DeleteListingDialogProps) {
  if (!listing) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2Icon className="size-5 text-destructive" />
            حذف الإعلان
          </AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من حذف هذا الإعلان؟ هذا الإجراء لا يمكن التراجع عنه.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border bg-muted/50 p-3">
          <p className="text-sm font-medium">{listing.title.ar || listing.title.en}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {listing.category?.name.ar || listing.category?.name.en} • {listing.governorate?.name.ar || listing.governorate?.name.en}
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-white hover:bg-destructive/90">
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
