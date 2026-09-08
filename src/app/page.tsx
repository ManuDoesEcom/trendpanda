import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Radar,
  Sparkles,
  TrendingUp,
  Video,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const FEATURES = [
  {
    icon: Video,
    title: "TikTok Trend Explorer",
    description:
      "Track view growth, engagement rate, and hashtag velocity for products going viral right now — before they show up everywhere.",
  },
  {
    icon: BarChart3,
    title: "Meta Ad Library Intelligence",
    description:
      "See every advertiser running a product, how long each ad has stayed live, and what creative angles are actually converting.",
  },
  {
    icon: Sparkles,
    title: "Opportunity Score",
    description:
      "One number that blends TikTok growth, active ad volume, ad longevity, margin, and competition — so you know what to test first.",
  },
  {
    icon: Wallet,
    title: "Financial Calculator",
    description:
      "Model selling price against sourcing cost instantly and see gross profit, margin, and break-even ROAS update live.",
  },
]

const STEPS = [
  {
    title: "Scan the market",
    description: "TrendPanda continuously indexes TikTok trend data and live Meta ad creatives across niches.",
  },
  {
    title: "Score every product",
    description: "Each product is ranked WINNER, POTENTIAL, or SATURATED using a weighted opportunity formula.",
  },
  {
    title: "Validate the numbers",
    description: "Drop in your sourcing cost and price to see real margin and break-even ROAS before you spend a dollar on ads.",
  },
]

export default function LandingPage() {
  return (
    <div className="flex-1 bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-heading text-sm font-semibold">
            <Radar className="size-4 text-primary" />
            TrendPanda
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/auth/login" />}>
              Log in
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/auth/signup" />}>
              Start free
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
          <Badge variant="secondary" className="mx-auto mb-6">
            <Sparkles className="text-primary" />
            TikTok + Meta Ads in one dashboard
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            Find winning dropshipping products before everyone else does
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-muted-foreground">
            TrendPanda fuses TikTok trend velocity with Meta Ad Library data into a single
            opportunity score, so you spend less time scrolling and more time launching.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/auth/signup" />}>
              Start researching free
              <ArrowRight />
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/dashboard" />}>
              View live demo
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="mb-2 size-5 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-border/60 bg-card/30">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mb-10 flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              <h2 className="font-heading text-2xl font-semibold">How it works</h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title}>
                  <div className="mb-3 flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </div>
                  <h3 className="mb-1.5 font-heading text-base font-medium">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="font-heading text-2xl font-semibold">
            Stop guessing which products will sell
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Get instant access to 14+ scored products, live ad creatives, and financial modeling.
          </p>
          <Button size="lg" className="mt-6" nativeButton={false} render={<Link href="/auth/signup" />}>
            Create your free account
            <ArrowRight />
          </Button>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-muted-foreground">
          <span>© 2026 TrendPanda. All rights reserved.</span>
          <span>Built for dropshipping research.</span>
        </div>
      </footer>
    </div>
  )
}
