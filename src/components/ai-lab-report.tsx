import { useMemo, useState } from "react"
import { Copy, Check, FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import type { SensorReading, UserEvent } from "@/lib/types"
import { METRIC_CONFIG, type MetricKey } from "@/lib/types"
import { computeStats } from "@/lib/csv-parser"
import { format } from "date-fns"

interface AiLabReportProps {
  data: SensorReading[]
  events: UserEvent[]
}

function buildDataSummary(data: SensorReading[], events: UserEvent[]): string {
  const stats = computeStats(data)
  const range = {
    start: data[0]?.timestamp,
    end: data[data.length - 1]?.timestamp,
  }

  let summary = `# Air Quality Data Summary\n\n`
  summary += `**Time Range:** ${range.start ? format(range.start, "MMM d, yyyy HH:mm") : "N/A"} to ${range.end ? format(range.end, "MMM d, yyyy HH:mm") : "N/A"}\n`
  summary += `**Total Readings:** ${data.length.toLocaleString()}\n\n`

  summary += `## Metrics Overview\n\n`
  for (const stat of stats) {
    if (!stat) continue
    const config = METRIC_CONFIG[stat.metric as MetricKey]
    summary += `### ${config.label} (${config.unit})\n`
    summary += `- Average: ${stat.avg.toFixed(1)}\n`
    summary += `- Maximum: ${stat.max.toFixed(1)}\n`
    summary += `- Minimum: ${stat.min.toFixed(1)}\n`
    summary += `- Data Points: ${stat.count}\n\n`
  }

  if (events.length > 0) {
    summary += `## Logged Events\n\n`
    for (const event of events) {
      summary += `- **${event.label}** at ${format(event.timestamp, "MMM d, yyyy HH:mm")}\n`
    }
    summary += `\n`
  }

  // Sample data points
  summary += `## Sample Readings\n\n`
  summary += `| Time | PM2.5 | PM10 | CO2 | VOC |\n`
  summary += `|------|-------|------|-----|-----|\n`

  const sampleIndices = new Set<number>()
  for (let i = 0; i < Math.min(5, data.length); i++) sampleIndices.add(i)
  for (let i = Math.max(0, data.length - 5); i < data.length; i++) sampleIndices.add(i)

  const sorted = [...sampleIndices].sort((a, b) => a - b)
  for (const idx of sorted) {
    const d = data[idx]
    summary += `| ${format(d.timestamp, "MMM d HH:mm:ss")} | ${d.pm25?.toFixed(1) ?? "N/A"} | ${d.pm10?.toFixed(1) ?? "N/A"} | ${d.co2?.toFixed(0) ?? "N/A"} | ${d.voc?.toFixed(1) ?? "N/A"} |\n`
  }

  return summary
}

const PROMPT_TEMPLATES = [
  {
    label: "General Analysis",
    prompt: "Analyze the air quality data below. Identify any patterns, anomalies, or concerning trends.",
  },
  {
    label: "Event Correlation",
    prompt: "Examine the logged events and the air quality readings. Describe how metrics changed before, during, and after.",
  },
  {
    label: "Health Assessment",
    prompt: "Based on WHO guidelines, assess whether these readings pose any health concerns.",
  },
  {
    label: "Custom Question",
    prompt: "",
  },
]

export function AiLabReport({ data, events }: AiLabReportProps) {
  const [copied, setCopied] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(0)
  const [customQuestion, setCustomQuestion] = useState("")

  const dataSummary = useMemo(() => buildDataSummary(data, events), [data, events])

  const fullPrompt = useMemo(() => {
    const template = PROMPT_TEMPLATES[selectedTemplate]
    const question = selectedTemplate === PROMPT_TEMPLATES.length - 1 ? customQuestion : template.prompt
    return `${question}\n\n---\n\n${dataSummary}`
  }, [selectedTemplate, customQuestion, dataSummary])

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      <CardHeader className="py-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <FlaskConical className="size-4 text-primary" /> AI Lab Report
        </CardTitle>
        <CardDescription className="text-xs">Copy prompt for AI analysis.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-4 pb-4">
        <div className="flex flex-wrap gap-2">
          {PROMPT_TEMPLATES.map((tpl, i) => (
            <Button key={i} variant={i === selectedTemplate ? "default" : "outline"} size="sm" onClick={() => setSelectedTemplate(i)} className="text-[10px] h-7">
              {tpl.label}
            </Button>
          ))}
        </div>
        {selectedTemplate === PROMPT_TEMPLATES.length - 1 && (
          <Textarea placeholder="Ask anything..." value={customQuestion} onChange={(e) => setCustomQuestion(e.target.value)} rows={2} className="text-xs" />
        )}
        <div className="relative">
          <pre className="max-h-32 overflow-auto rounded-lg bg-muted p-2 text-[10px] leading-relaxed">
            {fullPrompt}
          </pre>
          <Button size="sm" variant="outline" onClick={handleCopy} className="absolute right-1 top-1 h-6 text-[10px]">
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
