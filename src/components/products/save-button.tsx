"use client"

import { useState, useTransition } from "react"
import { Bookmark, Loader2 } from "lucide-react"
import { toggleSaveProduct } from "@/lib/actions/saved-products"
import { Button } from "@/components/ui/button"
import { cn } from "cn"

export function SaveButton({
  productId,
  initialSaved,
  variant = "outline",
  size = "sm",
}: {
  productId: string
  initialSaved: boolean
  variant?: "outline" | "secondary" | "ghost"
  size?: "sm" | "default" | "icon"
}) {
  const [saved, setSaved] = useState(initialSaved)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    setSaved((prev) => !prev)
    startTransition(async () => {
      const result = await toggleSaveProduct(productId)
      if (result.error) {
        setSaved((prev) => !prev)
        return
      }
      setSaved(result.saved)
    })
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={saved}
      className={size === "icon" ? undefined : "gap-1.5"}
    >
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Bookmark className={cn(saved && "fill-current")} />
      )}
      {size !== "icon" && (saved ? "Saved" : "Save")}
    </Button>
  )
}
