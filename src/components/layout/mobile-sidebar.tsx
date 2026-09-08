"use client"

import { useState } from "react"
import { Menu, Radar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { UserMenu } from "@/components/layout/user-menu"

export function MobileSidebar({
  email,
  fullName,
  avatarUrl,
}: {
  email: string
  fullName?: string | null
  avatarUrl?: string | null
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
        <Menu />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
        <SheetHeader className="border-b border-sidebar-border/60 p-4">
          <SheetTitle className="flex items-center gap-2 text-sidebar-foreground">
            <Radar className="size-4 text-primary" />
            TrendPanda
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col justify-between overflow-y-auto py-3">
          <SidebarNav onNavigate={() => setOpen(false)} />
          <div className="mt-4 border-t border-sidebar-border/60 px-3 pt-3">
            <UserMenu email={email} fullName={fullName} avatarUrl={avatarUrl} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
