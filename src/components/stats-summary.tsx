import { useMemo } from "react"
import { Wind, Droplets, Flame, Leaf } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { SensorReading } from "@/lib/types"
import { METRIC_CONFIG, type MetricKey } from "@/lib/types"

const METRIC_ICONS: Record<MetricKey, React.ElementType> = {
  pm25: Droplets,
  pm10: Wind,
  co2: Flame,
  voc: Leaf,
}

export function StatsSummary({ data }: { data: SensorReading[] }) {
  const stats = useMemo(() => {
    const keys: MetricKey[] = ["pm25", "pm10", "co2", "voc"]
    return keys
      .map((key) => {
        const values = data
          .map((d) => d[key])
          .filter((v): v is number => typeof v === "number")
        if (values.length === 0) return null
        return {
          key,
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          max: Math.max(...values),
          min: Math.min(...values),
        }
      })
      .filter(Boolean)
  }, [data])

  if (stats.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => {
        if (!s) return null;
        const config = METRIC_CONFIG[s.key as MetricKey]
        const Icon = METRIC_ICONS[s.key as MetricKey]

        return (
          <Card key={s.key} className="gap-0 py-4">
            <CardContent className="px-4 py-0 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{config.label}</p>
                <p className="text-2xl font-bold">{s.avg.toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground">{config.unit}</p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
