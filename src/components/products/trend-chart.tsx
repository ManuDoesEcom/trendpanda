"use client"

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { DailyMetricPoint } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCompactNumber } from "@/lib/utils/financial"

const TIKTOK_COLOR = "#a1a1aa"
const META_COLOR = "#34d399"

function formatDateLabel(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; dataKey: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{label ? formatDateLabel(label) : ""}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-1.5 text-muted-foreground">
          <span
            className="inline-block size-2 rounded-full"
            style={{ background: entry.dataKey === "tiktokViews" ? TIKTOK_COLOR : META_COLOR }}
          />
          {entry.dataKey === "tiktokViews"
            ? `${formatCompactNumber(entry.value)} TikTok views`
            : `${entry.value} active Meta ads`}
        </p>
      ))}
    </div>
  )
}

export function TrendChart({ history }: { history: DailyMetricPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>30-Day Trend</CardTitle>
        <CardDescription>TikTok view velocity vs. active Meta ad count</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 pb-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full" style={{ background: TIKTOK_COLOR }} />
            TikTok views
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full" style={{ background: META_COLOR }} />
            Active Meta ads
          </span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={history} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="tiktokViewsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={TIKTOK_COLOR} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={TIKTOK_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateLabel}
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                yAxisId="views"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => formatCompactNumber(value)}
                width={44}
              />
              <YAxis
                yAxisId="ads"
                orientation="right"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                yAxisId="views"
                type="monotone"
                dataKey="tiktokViews"
                stroke="none"
                fill="url(#tiktokViewsFill)"
                isAnimationActive={false}
              />
              <Line
                yAxisId="views"
                type="monotone"
                dataKey="tiktokViews"
                stroke={TIKTOK_COLOR}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Bar
                yAxisId="ads"
                dataKey="metaActiveAds"
                fill={META_COLOR}
                radius={[3, 3, 0, 0]}
                barSize={6}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
