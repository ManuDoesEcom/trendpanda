import type {
  AdCallToAction,
  AdPlatform,
  DailyMetricPoint,
  MetaAd,
  Product,
  ProductCategory,
  TikTokMetrics,
} from "@/lib/types"
import { scoreFromProduct } from "@/lib/utils/scoring"
import { SAMPLE_VIDEO_URLS } from "@/lib/utils/sample-media"

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

function buildHistory(
  seed: number,
  peakViews: number,
  peakAds: number,
  trend: "rising" | "falling" | "flat"
): DailyMetricPoint[] {
  const rand = seededRandom(seed)
  const days = 30
  const points: DailyMetricPoint[] = []
  const today = new Date("2026-09-08")

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const progress = (days - i) / days

    let curve = progress
    if (trend === "falling") curve = 1 - progress * 0.6
    if (trend === "flat") curve = 0.7 + progress * 0.1

    const noise = 0.85 + rand() * 0.3
    const tiktokViews = Math.round(peakViews * curve * noise * 0.4)
    const metaActiveAds = Math.max(0, Math.round(peakAds * curve * noise))

    points.push({
      date: date.toISOString().slice(0, 10),
      tiktokViews,
      metaActiveAds,
    })
  }

  return points
}

function buildTikTok(
  seed: number,
  totalViews: number,
  engagementRate: number,
  growthRate30d: number,
  peakAds: number,
  hashtags: string[],
  trend: "rising" | "falling" | "flat" = "rising"
): TikTokMetrics {
  const totalLikes = Math.round(totalViews * (engagementRate / 100) * 0.82)
  const totalShares = Math.round(totalViews * (engagementRate / 100) * 0.11)
  const totalComments = Math.round(totalViews * (engagementRate / 100) * 0.07)

  return {
    totalViews,
    totalLikes,
    totalShares,
    totalComments,
    engagementRate,
    growthRate30d,
    videoCount: Math.round(120 + seed * 3.7),
    topHashtags: hashtags,
    history: buildHistory(seed, totalViews, peakAds, trend),
  }
}

const ADVERTISERS = [
  "GlowNest",
  "UrbanNest Co",
  "PawLuxe",
  "FlexFit Gear",
  "NovaHome",
  "DailyDrip Shop",
  "PureVibe Living",
  "TrendCart",
  "SnugLife",
  "ZenDesk Supply",
]

const CTAS: AdCallToAction[] = ["Shop Now", "Learn More", "Get Offer", "Buy Now", "Sign Up"]
const ALL_PLATFORMS: AdPlatform[] = ["Facebook", "Instagram", "Messenger", "Audience Network"]

function buildAds(
  productSeed: number,
  count: number,
  copies: string[],
  headline: string,
  mediaSeedPrefix: string
): MetaAd[] {
  const rand = seededRandom(productSeed * 17)
  const ads: MetaAd[] = []

  for (let i = 0; i < count; i++) {
    const advertiser = ADVERTISERS[Math.floor(rand() * ADVERTISERS.length)]
    const activeSinceDays = Math.round(3 + rand() * 62)
    const platformCount = 1 + Math.floor(rand() * 3)
    const shuffled = [...ALL_PLATFORMS].sort(() => rand() - 0.5)
    const isVideo = i % 3 === 0
    const mediaUrl = isVideo
      ? SAMPLE_VIDEO_URLS[i % SAMPLE_VIDEO_URLS.length]
      : `https://picsum.photos/seed/${mediaSeedPrefix}-ad-${i}/720/1280`

    ads.push({
      id: `${mediaSeedPrefix}-ad-${i + 1}`,
      advertiserName: `${advertiser}${i > 0 ? ` ${i + 1}` : ""}`,
      advertiserAvatarUrl: `https://i.pravatar.cc/150?u=${mediaSeedPrefix}-${i}`,
      adCopy: copies[i % copies.length],
      headline,
      mediaUrl,
      mediaType: isVideo ? "video" : "image",
      cta: CTAS[Math.floor(rand() * CTAS.length)],
      platforms: shuffled.slice(0, platformCount),
      activeSinceDays,
      isActive: rand() > 0.25,
      estimatedSpend: rand() > 0.66 ? "High" : rand() > 0.33 ? "Medium" : "Low",
      landingPageUrl: `https://example-store.com/products/${mediaSeedPrefix}`,
    })
  }

  return ads
}

interface ProductSeed {
  id: string
  title: string
  category: ProductCategory
  description: string
  sellingPrice: number
  sourcingCost: number
  totalViews: number
  engagementRate: number
  growthRate30d: number
  adCount: number
  hashtags: string[]
  copies: string[]
  headline: string
  trend: "rising" | "falling" | "flat"
  competitorCount: number
  seed: number
}

const PRODUCT_SEEDS: ProductSeed[] = [
  {
    id: "aurora-galaxy-projector",
    title: "Aurora Galaxy Star Projector",
    category: "Home & Kitchen",
    description:
      "Bluetooth-enabled nebula and star projector that turns any bedroom into a planetarium, with 21 lighting modes and voice control.",
    sellingPrice: 49.99,
    sourcingCost: 11.5,
    totalViews: 48_200_000,
    engagementRate: 9.4,
    growthRate30d: 142,
    adCount: 9,
    hashtags: ["#galaxyprojector", "#roomdecor", "#tiktokmademebuyit", "#auroralight"],
    copies: [
      "This turned my boring bedroom into a whole GALAXY 🌌 Use code STAR15 for 15% off tonight only.",
      "POV: you finally fix your sleep because your room feels like a spaceship now ✨",
      "Everyone in the comments asking where I got this... link below 👇",
    ],
    headline: "Transform Any Room Into a Galaxy",
    trend: "rising",
    competitorCount: 6,
    seed: 1,
  },
  {
    id: "cloudfoam-neck-massager",
    title: "CloudFoam Smart Neck Massager",
    category: "Beauty & Personal Care",
    description:
      "Portable EMS neck massager with heat therapy, 4 intensity modes, and USB-C charging designed for desk workers and commuters.",
    sellingPrice: 39.99,
    sourcingCost: 9.2,
    totalViews: 31_500_000,
    engagementRate: 7.8,
    growthRate30d: 96,
    adCount: 11,
    hashtags: ["#neckmassager", "#deskworker", "#selfcare", "#tiktokshop"],
    copies: [
      "My physical therapist told me to stop hunching. This little thing saved my neck 😩",
      "Sitting at a desk 9 hours a day and this is the only thing that actually helps.",
      "Heat + massage in one device — I use this every single night now.",
    ],
    headline: "Relief In Minutes, Not Hours",
    trend: "rising",
    competitorCount: 9,
    seed: 2,
  },
  {
    id: "pawluxe-deshedding-brush",
    title: "PawLuxe Self-Cleaning Deshedding Brush",
    category: "Pet Supplies",
    description:
      "One-click self-cleaning slicker brush that removes up to 95% of loose undercoat fur without irritating skin.",
    sellingPrice: 27.99,
    sourcingCost: 6.4,
    totalViews: 62_800_000,
    engagementRate: 11.2,
    growthRate30d: 187,
    adCount: 14,
    hashtags: ["#dogsoftiktok", "#petgrooming", "#deshedding", "#dogmom"],
    copies: [
      "The amount of fur that came off my golden retriever is UNREAL 😱 watch till the end",
      "One click and all the fur just... falls off the brush. Game changer for pet owners.",
      "My couch has never been this fur-free. Ordering a second one for the car.",
    ],
    headline: "95% Less Shedding In One Brush",
    trend: "rising",
    competitorCount: 4,
    seed: 3,
  },
  {
    id: "flexfit-resistance-bands",
    title: "FlexFit 5-Piece Resistance Band Set",
    category: "Fitness & Sports",
    description:
      "Graduated resistance bands (10-50lb) with door anchor, handles, and ankle straps for full-body home workouts.",
    sellingPrice: 34.99,
    sourcingCost: 8.75,
    totalViews: 18_900_000,
    engagementRate: 6.1,
    growthRate30d: 41,
    adCount: 7,
    hashtags: ["#homeworkout", "#resistancebands", "#fitnessgear", "#gymtok"],
    copies: [
      "Cancelled my gym membership after getting these. Full body workout at home.",
      "5 resistance levels means these grow with you as you get stronger.",
      "Perfect for travel — folds into a bag smaller than a water bottle.",
    ],
    headline: "Your Home Gym In One Box",
    trend: "flat",
    competitorCount: 13,
    seed: 4,
  },
  {
    id: "posturepro-corrector",
    title: "PosturePro Adjustable Back Corrector",
    category: "Fitness & Sports",
    description:
      "Breathable posture corrector brace with adjustable straps that gently pulls shoulders back to relieve upper back tension.",
    sellingPrice: 26.99,
    sourcingCost: 5.9,
    totalViews: 9_400_000,
    engagementRate: 4.3,
    growthRate30d: -18,
    adCount: 3,
    hashtags: ["#posturecorrector", "#backpain", "#wfh"],
    copies: [
      "My chiropractor actually recommended something like this for desk posture.",
      "Wearing this under my shirt for 2 weeks and already feel a difference.",
    ],
    headline: "Fix Your Posture In 30 Days",
    trend: "falling",
    competitorCount: 21,
    seed: 5,
  },
  {
    id: "trimx-cordless-clipper",
    title: "TrimX Pro Cordless Hair Trimmer",
    category: "Beauty & Personal Care",
    description:
      "Waterproof cordless hair and beard trimmer with titanium blades, LED display, and 90-minute battery life.",
    sellingPrice: 44.99,
    sourcingCost: 13.8,
    totalViews: 27_300_000,
    engagementRate: 8.6,
    growthRate30d: 68,
    adCount: 10,
    hashtags: ["#mensgrooming", "#hairtrimmer", "#barbertok", "#fade"],
    copies: [
      "Barber-quality fade at home. This thing is sharper than my last 3 trimmers combined.",
      "Waterproof so I just rinse it under the tap — cleanup takes 10 seconds.",
      "Battery lasts through 3 full haircuts on one charge, no joke.",
    ],
    headline: "Barber-Grade Precision At Home",
    trend: "rising",
    competitorCount: 8,
    seed: 6,
  },
  {
    id: "gripmount-magsafe-car-mount",
    title: "GripMount Magnetic Car Phone Mount",
    category: "Electronics & Gadgets",
    description:
      "MagSafe-compatible magnetic car vent mount with 360° rotation and 12 N52 magnets for rock-solid phone stability.",
    sellingPrice: 22.99,
    sourcingCost: 4.6,
    totalViews: 14_600_000,
    engagementRate: 5.4,
    growthRate30d: 23,
    adCount: 6,
    hashtags: ["#cargadgets", "#magsafe", "#roadtrip"],
    copies: [
      "Drove over every pothole I could find and the phone didn't budge once.",
      "No more fumbling with clunky claw mounts — just snap it on and go.",
    ],
    headline: "Never Drop Your Phone Again",
    trend: "flat",
    competitorCount: 17,
    seed: 7,
  },
  {
    id: "hydrasnap-collapsible-bottle",
    title: "HydraSnap Collapsible Water Bottle",
    category: "Outdoor & Garden",
    description:
      "Leak-proof silicone collapsible water bottle that folds flat, with a built-in carabiner clip and 750ml capacity.",
    sellingPrice: 24.99,
    sourcingCost: 5.1,
    totalViews: 11_200_000,
    engagementRate: 4.9,
    growthRate30d: 12,
    adCount: 4,
    hashtags: ["#hiking", "#zerowaste", "#outdoorgear"],
    copies: [
      "Folds flat into my backpack pocket when it's empty — such a space saver on hikes.",
      "Been using this on every trail run for a month, zero leaks so far.",
    ],
    headline: "The Bottle That Folds Flat",
    trend: "flat",
    competitorCount: 19,
    seed: 8,
  },
  {
    id: "snaplab-mini-photo-printer",
    title: "SnapLab Mini Instant Photo Printer",
    category: "Electronics & Gadgets",
    description:
      "Pocket-sized Bluetooth photo printer with zero-ink technology that prints 2x3 sticky-back photos straight from your phone.",
    sellingPrice: 59.99,
    sourcingCost: 16.2,
    totalViews: 39_700_000,
    engagementRate: 10.1,
    growthRate30d: 121,
    adCount: 12,
    hashtags: ["#instantprint", "#scrapbook", "#tiktokfinds", "#photobooth"],
    copies: [
      "Turned my camera roll into a physical scrapbook in one afternoon 🥹",
      "No ink cartridges, ever. It's genuinely magic how these prints come out this clean.",
      "Brought this to a party and it turned into an instant photobooth. Everyone wanted one.",
    ],
    headline: "Print Your Memories, Instantly",
    trend: "rising",
    competitorCount: 5,
    seed: 9,
  },
  {
    id: "zengrip-acupressure-mat",
    title: "ZenGrip Acupressure Mat & Pillow Set",
    category: "Beauty & Personal Care",
    description:
      "Dual-density acupressure mat and pillow set with 6,210 stimulation points to relieve tension and improve circulation.",
    sellingPrice: 32.99,
    sourcingCost: 7.4,
    totalViews: 16_800_000,
    engagementRate: 6.7,
    growthRate30d: 34,
    adCount: 5,
    hashtags: ["#acupressure", "#selfcareroutine", "#backpainrelief"],
    copies: [
      "Painful for the first 2 minutes, then the most relaxing 20 minutes of my day.",
      "My mom is obsessed with this now, she uses it every night before bed.",
    ],
    headline: "20 Minutes To Total Relief",
    trend: "rising",
    competitorCount: 11,
    seed: 10,
  },
  {
    id: "glowray-led-skin-wand",
    title: "GlowRay LED Skincare Wand",
    category: "Beauty & Personal Care",
    description:
      "4-in-1 LED light therapy skincare wand combining red light, microcurrent, vibration, and heat for at-home facials.",
    sellingPrice: 68.0,
    sourcingCost: 19.5,
    totalViews: 54_900_000,
    engagementRate: 9.9,
    growthRate30d: 158,
    adCount: 16,
    hashtags: ["#ledtherapy", "#skincaretok", "#glowup", "#antiaging"],
    copies: [
      "3 weeks of using this every night and my skin genuinely looks different.",
      "This is the closest thing to an in-office facial you'll get at home.",
      "Dermatologist-adjacent results for a fraction of the spa price. Sold out twice already.",
    ],
    headline: "Salon Results, Zero Appointment",
    trend: "rising",
    competitorCount: 7,
    seed: 11,
  },
  {
    id: "deskrise-laptop-stand",
    title: "DeskRise Foldable Laptop Stand",
    category: "Electronics & Gadgets",
    description:
      "Aluminum adjustable laptop stand that folds to pocket size, supports up to 17-inch laptops with 6 height settings.",
    sellingPrice: 29.99,
    sourcingCost: 6.8,
    totalViews: 8_100_000,
    engagementRate: 3.8,
    growthRate30d: -9,
    adCount: 2,
    hashtags: ["#deskgadgets", "#wfhsetup", "#productivity"],
    copies: [
      "My neck pain from hunching over my laptop is finally gone.",
      "Folds down small enough to fit in my laptop sleeve for travel.",
    ],
    headline: "Ergonomics That Fit In Your Bag",
    trend: "falling",
    competitorCount: 24,
    seed: 12,
  },
  {
    id: "dreamveil-cooling-sleep-mask",
    title: "DreamVeil Cooling Sleep Mask",
    category: "Beauty & Personal Care",
    description:
      "3D contoured cooling gel sleep mask with adjustable strap that blocks 100% of light while soothing tired eyes.",
    sellingPrice: 21.99,
    sourcingCost: 4.3,
    totalViews: 22_400_000,
    engagementRate: 7.1,
    growthRate30d: 57,
    adCount: 8,
    hashtags: ["#sleepmask", "#nighttimeroutine", "#selfcaresunday"],
    copies: [
      "Kept it in the freezer and now bedtime is my favorite part of the day.",
      "3D shape means zero pressure on your eyes, unlike every other mask I've tried.",
    ],
    headline: "The Coolest Way To Fall Asleep",
    trend: "rising",
    competitorCount: 10,
    seed: 13,
  },
  {
    id: "tinytrek-baby-carrier-wrap",
    title: "TinyTrek Ergonomic Baby Wrap Carrier",
    category: "Baby & Kids",
    description:
      "Breathable 4-way stretch baby wrap carrier that evenly distributes weight, safe for newborns up to 35lbs.",
    sellingPrice: 44.0,
    sourcingCost: 12.1,
    totalViews: 19_600_000,
    engagementRate: 8.2,
    growthRate30d: 73,
    adCount: 9,
    hashtags: ["#babywrap", "#newmom", "#babywearing", "#momtok"],
    copies: [
      "Finally a carrier that doesn't destroy my back after an hour of wear.",
      "Baby fell asleep in 5 minutes every single time I wrap her in this.",
      "Breathable fabric means no overheating even in summer — lifesaver.",
    ],
    headline: "Hands Free, Baby Happy",
    trend: "rising",
    competitorCount: 8,
    seed: 14,
  },
]

function buildProduct(seed: ProductSeed): Product {
  const tiktok = buildTikTok(
    seed.seed,
    seed.totalViews,
    seed.engagementRate,
    seed.growthRate30d,
    seed.adCount,
    seed.hashtags,
    seed.trend
  )
  const metaAds = buildAds(seed.seed, seed.adCount, seed.copies, seed.headline, seed.id)

  const { score, badge } = scoreFromProduct({
    sellingPrice: seed.sellingPrice,
    sourcingCost: seed.sourcingCost,
    tiktok,
    metaAds,
    competitorCount: seed.competitorCount,
  })

  const createdAt = new Date("2026-09-08")
  createdAt.setDate(createdAt.getDate() - seed.seed * 3)

  return {
    id: seed.id,
    title: seed.title,
    slug: seed.id,
    description: seed.description,
    category: seed.category,
    imageUrls: [
      `https://picsum.photos/seed/${seed.id}-1/800/800`,
      `https://picsum.photos/seed/${seed.id}-2/800/800`,
      `https://picsum.photos/seed/${seed.id}-3/800/800`,
    ],
    // Hand-authored demo products have no real TikTok source video.
    tiktokVideoId: null,
    sellingPrice: seed.sellingPrice,
    sourcingCost: seed.sourcingCost,
    tiktok,
    metaAds,
    supplierUrl: `https://www.alibaba.com/product-detail/${seed.id}.html`,
    createdAt: createdAt.toISOString(),
    opportunityScore: score,
    opportunityBadge: badge,
  }
}

export const MOCK_PRODUCTS: Product[] = PRODUCT_SEEDS.map(buildProduct)

export function getMockProductById(id: string): Product | undefined {
  return MOCK_PRODUCTS.find((product) => product.id === id)
}

export const CATEGORIES: ProductCategory[] = [
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Pet Supplies",
  "Fitness & Sports",
  "Fashion & Accessories",
  "Electronics & Gadgets",
  "Baby & Kids",
  "Outdoor & Garden",
]
