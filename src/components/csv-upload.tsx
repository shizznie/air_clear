import { useCallback, useState } from "react"
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CsvUploadProps {
  onFileSelected: (file: File) => void
  isLoading: boolean
}

export function CsvUpload({ onFileSelected, isLoading }: CsvUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateAndEmit = useCallback(
    (file: File) => {
      setError(null)
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Please upload a CSV file")
        return
      }
      if (file.size > 50 * 1024 * 1024) {
        setError("File size must be under 50MB")
        return
      }
      onFileSelected(file)
    },
    [onFileSelected]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) validateAndEmit(file)
    },
    [validateAndEmit]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) validateAndEmit(file)
    },
    [validateAndEmit]
  )

  return (
    <div className="flex flex-col items-center gap-4">
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex w-full max-w-xl cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed px-8 py-12 text-center transition-all",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/40",
          isLoading && "pointer-events-none opacity-60"
        )}
      >
        <div
          className={cn(
            "flex size-14 items-center justify-center rounded-xl transition-colors",
            isDragOver ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
          )}
        >
          {isLoading ? (
            <FileSpreadsheet className="size-7 animate-pulse" />
          ) : (
            <Upload className="size-7" />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {isLoading ? "Parsing your data..." : "Drop your CSV file here"}
          </p>
          <p className="text-xs text-muted-foreground">
            {"Supports PM2.5, PM10, CO\u2082, and VOC sensor data"}
          </p>
        </div>

        {!isLoading && (
          <span className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Browse Files
          </span>
        )}

        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="sr-only"
          disabled={isLoading}
        />
      </label>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
