import { useState, useMemo, useCallback } from "react"
import { Wind } from "lucide-react"
import { CsvUpload } from "@/components/csv-upload"
import { StatsSummary } from "@/components/stats-summary"
import { AirQualityChart } from "@/components/air-quality-chart"
import { EventLogger, DataFileSummary } from "@/components/event-logger"
import { AiLabReport } from "@/components/ai-lab-report"
import { parseCSV } from "@/lib/csv-parser"
import type { SensorReading, UserEvent, MetricKey } from "@/lib/types"

export function Dashboard() {
  const [data, setData] = useState<SensorReading[]>([])
  const [fileName, setFileName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [events, setEvents] = useState<UserEvent[]>([])
  const [brushIndex, setBrushIndex] = useState<[number, number] | undefined>()

  const dataRange = useMemo(() => {
    if (data.length === 0) return null
    return { min: data[0].timestamp, max: data[data.length - 1].timestamp }
  }, [data])

  const availableMetrics = useMemo(() => {
    const keys: MetricKey[] = ["pm25", "pm10", "co2", "voc"]
    return keys.filter((key) =>
      data.some(
        (d) => d[key] !== null && d[key] !== undefined
      )
    )
  }, [data])

  const handleFileSelected = useCallback(async (file: File) => {
    setIsLoading(true)
    try {
      const readings = await parseCSV(file)
      setData(readings)
      setFileName(file.name)
      setEvents([])
      setBrushIndex(undefined)
    } catch (err) {
      console.error("Failed to parse CSV:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleReset = useCallback(() => {
    setData([])
    setFileName("")
    setEvents([])
    setBrushIndex(undefined)
  }, [])

  const handleAddEvent = useCallback((event: UserEvent) => {
    setEvents((prev) => [...prev, event])
  }, [])

  const handleRemoveEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const handleBrushChange = useCallback((start: number, end: number) => {
    setBrushIndex([start, end])
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Wind className="size-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              AirLens
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        {data.length === 0 ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Upload Your Sensor Data
              </h2>
            </div>
            <CsvUpload onFileSelected={handleFileSelected} isLoading={isLoading} />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <DataFileSummary data={data} fileName={fileName} onReset={handleReset} />
            <StatsSummary data={data} />
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
              <div className="flex flex-col gap-4">
                {availableMetrics.map((key, index) => (
                  <AirQualityChart
                    key={key}
                    data={data}
                    metricKey={key}
                    events={events}
                    syncId="air-quality"
                    showBrush={index === 0}
                    brushIndex={brushIndex}
                    onBrushChange={handleBrushChange}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-4">
                <EventLogger events={events} onAddEvent={handleAddEvent} onRemoveEvent={handleRemoveEvent} dataRange={dataRange} />
                <AiLabReport data={data} events={events} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
