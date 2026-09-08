"use client"

import { useMemo, useState } from "react"
import { Calculator } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { calculateFinancials, formatCurrency, formatPercent } from "@/lib/utils/financial"

export function FinancialCalculator({
  initialSellingPrice,
  initialSourcingCost,
}: {
  initialSellingPrice: number
  initialSourcingCost: number
}) {
  const [sellingPrice, setSellingPrice] = useState(initialSellingPrice)
  const [sourcingCost, setSourcingCost] = useState(initialSourcingCost)

  const financials = useMemo(
    () => calculateFinancials(sellingPrice, sourcingCost),
    [sellingPrice, sourcingCost]
  )

  const marginTone =
    financials.profitMargin >= 50
      ? "text-emerald-500"
      : financials.profitMargin >= 25
        ? "text-amber-500"
        : "text-destructive"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="size-4 text-primary" />
          Financial Calculator
        </CardTitle>
        <CardDescription>Model your margin before you commit ad spend.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="selling-price">Selling price</Label>
            <Input
              id="selling-price"
              type="number"
              min={1}
              step={0.5}
              value={sellingPrice}
              onChange={(event) => setSellingPrice(Math.max(1, Number(event.target.value) || 0))}
              className="w-24 text-right"
            />
          </div>
          <Slider
            value={[sellingPrice]}
            min={5}
            max={150}
            step={0.5}
            onValueChange={(value) => setSellingPrice(Array.isArray(value) ? value[0] : value)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="sourcing-cost">Sourcing cost</Label>
            <Input
              id="sourcing-cost"
              type="number"
              min={0}
              step={0.25}
              value={sourcingCost}
              onChange={(event) => setSourcingCost(Math.max(0, Number(event.target.value) || 0))}
              className="w-24 text-right"
            />
          </div>
          <Slider
            value={[sourcingCost]}
            min={1}
            max={80}
            step={0.25}
            onValueChange={(value) => setSourcingCost(Array.isArray(value) ? value[0] : value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Gross profit</span>
            <span className="font-heading text-lg font-semibold">
              {formatCurrency(financials.grossProfit)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Profit margin</span>
            <span className={`font-heading text-lg font-semibold ${marginTone}`}>
              {formatPercent(financials.profitMargin)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Break-even ROAS</span>
            <span className="font-heading text-lg font-semibold">
              {Number.isFinite(financials.breakEvenRoas)
                ? `${financials.breakEvenRoas.toFixed(2)}x`
                : "—"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
