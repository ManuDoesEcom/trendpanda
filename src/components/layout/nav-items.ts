import type { LucideIcon } from "lucide-react"
import {
  Archive,
  Bookmark,
  LayoutGrid,
  LayoutDashboard,
  Megaphone,
  Music2,
} from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  description: string
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview & top opportunities",
  },
  {
    href: "/all-in-one",
    label: "All-in-One",
    icon: LayoutGrid,
    description: "TikTok + Meta combined research",
  },
  {
    href: "/tiktok",
    label: "TikTok Explorer",
    icon: Music2,
    description: "Trending products on TikTok",
  },
  {
    href: "/meta",
    label: "Meta Explorer",
    icon: Megaphone,
    description: "Meta Ad Library research",
  },
  {
    href: "/ads",
    label: "Ads Vault",
    icon: Archive,
    description: "Every ad creative in one place",
  },
  {
    href: "/saved",
    label: "Saved",
    icon: Bookmark,
    description: "Your collections",
  },
]
