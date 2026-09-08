import type { ReactNode } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Radar } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { UserMenu } from "@/components/layout/user-menu"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle()

  const email = user.email ?? ""
  const fullName = profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? null
  const avatarUrl = profile?.avatar_url ?? (user.user_metadata?.avatar_url as string | undefined) ?? null

  return (
    <div className="flex min-h-screen flex-1 bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <Link
          href="/dashboard"
          className="flex h-14 items-center gap-2 border-b border-sidebar-border/60 px-4 font-heading text-sm font-semibold"
        >
          <Radar className="size-4 text-primary" />
          TrendPanda
        </Link>
        <div className="flex flex-1 flex-col justify-between overflow-y-auto py-3">
          <SidebarNav />
          <div className="mt-4 border-t border-sidebar-border/60 px-3 pt-3">
            <UserMenu email={email} fullName={fullName} avatarUrl={avatarUrl} />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/95 px-4 backdrop-blur-sm md:px-6">
          <MobileSidebar email={email} fullName={fullName} avatarUrl={avatarUrl} />
          <Link href="/dashboard" className="flex items-center gap-2 font-heading text-sm font-semibold md:hidden">
            <Radar className="size-4 text-primary" />
            TrendPanda
          </Link>
        </header>
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </div>
  )
}
