"use client"

import * as React from "react"
import { CheckCircle2Icon, XCircleIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Listing } from "@/lib/types/listing"

interface ListingActionsDialogProps {
  listing: Listing | null
  action: "approve" | "reject" | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (status: Listing["status"], reason?: string) => void
}

export function ListingActionsDialog({ listing, action, open, onOpenChange, onConfirm }: ListingActionsDialogProps) {
  const [reason, setReason] = React.useState("")

  const handleConfirm = () => {
    if (action === "approve") {
      onConfirm("approved")
    } else if (action === "reject") {
      onConfirm("rejected", reason)
    }
    setReason("")
    onOpenChange(false)
  }

  if (!listing || !action) return null

  const isApprove = action === "approve"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApprove ? (
              <>
                <CheckCircle2Icon className="size-5 text-green-600" />
                اعتماد الإعلان
              </>
            ) : (
              <>
                <XCircleIcon className="size-5 text-red-600" />
                رفض الإعلان
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? "هل أنت متأكد من اعتماد هذا الإعلان؟ سيتم نشره للمستخدمين."
              : "هل أنت متأكد من رفض هذا الإعلان؟ يرجى تقديم سبب الرفض."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-sm font-medium">{listing.title.ar || listing.title.en}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {listing.category?.name.ar || listing.category?.name.en} • {listing.governorate?.name.ar || listing.governorate?.name.en}
            </p>
          </div>

          {!isApprove && (
            <div className="space-y-2">
              <Label htmlFor="reason">سبب الرفض *</Label>
              <Textarea
                id="reason"
                placeholder="اكتب سبب رفض الإعلان..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            variant={isApprove ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={!isApprove && !reason.trim()}
          >
            {isApprove ? "اعتماد" : "رفض"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
