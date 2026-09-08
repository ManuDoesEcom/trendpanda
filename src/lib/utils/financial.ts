import type { FinancialCalculation } from "@/lib/types"

export function calculateFinancials(sellingPrice: number, sourcingCost: number): FinancialCalculation {
  const grossProfit = sellingPrice - sourcingCost
  const profitMargin = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0
  const breakEvenRoas = profitMargin > 0 ? 100 / profitMargin : Infinity

  return {
    sellingPrice,
    sourcingCost,
    grossProfit,
    profitMargin,
    breakEvenRoas,
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${value.toFixed(fractionDigits)}%`
}
