import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SensorReading, UserEvent, MetricKey } from "@/lib/types"
import { METRIC_CONFIG } from "@/lib/types"
import { format } from "date-fns"

interface AirQualityChartProps {
  data: SensorReading[]
  metricKey: MetricKey
  events: UserEvent[]
  syncId: string
  brushIndex?: [number, number]
  onBrushChange?: (startIndex: number, endIndex: number) => void
  showBrush?: boolean
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: number
}) {
  if (!active || !payload?.length || !label) return null

  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-card-foreground shadow-md">
      <p className="mb-1 text-xs text-muted-foreground">
        {format(new Date(label), "MMM d, yyyy HH:mm:ss")}
      </p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value != null ? entry.value.toFixed(1) : "N/A"}
        </p>
      ))}
    </div>
  )
}

export function AirQualityChart({
  data,
  metricKey,
  events,
  syncId,
  brushIndex,
  onBrushChange,
  showBrush = false,
}: AirQualityChartProps) {
  const config = METRIC_CONFIG[metricKey]

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        time: d.timestamp.getTime(),
        [metricKey]: d[metricKey],
      })),
    [data, metricKey]
  )

  const hasData = useMemo(
    () => chartData.some((d) => d[metricKey] !== null && d[metricKey] !== undefined),
    [chartData, metricKey]
  )

  if (!hasData) return null

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      <CardHeader className="py-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ backgroundColor: config.color }}
          />
          {config.label}
          <span className="text-xs font-normal text-muted-foreground">
            ({config.unit})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} syncId={syncId}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border/50"
            />
            <XAxis
              dataKey="time"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(val) => format(new Date(val), "HH:mm")}
              className="text-xs"
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={metricKey}
              stroke={config.color}
              strokeWidth={2}
              dot={false}
              connectNulls
              activeDot={{ r: 4, strokeWidth: 0 }}
            />

            {events.map((event) => (
              <ReferenceLine
                key={event.id}
                x={event.timestamp.getTime()}
                stroke={event.color}
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: event.label,
                  position: "top",
                  fill: event.color,
                  fontSize: 10,
                  fontWeight: 500,
                }}
              />
            ))}

            {showBrush && (
              <Brush
                dataKey="time"
                height={30}
                stroke="var(--color-primary)"
                fill="var(--color-secondary)"
                tickFormatter={(val) => format(new Date(val), "HH:mm")}
                startIndex={brushIndex?.[0]}
                endIndex={brushIndex?.[1]}
                onChange={(range) => {
                  if (onBrushChange && range.startIndex !== undefined && range.endIndex !== undefined) {
                    onBrushChange(range.startIndex, range.endIndex)
                  }
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
