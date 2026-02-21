export interface SensorReading {
  timestamp: Date;
  pm25?: number;
  pm10?: number;
  co2?: number;
  voc?: number;
  [key: string]: any;
}

export interface UserEvent {
  id: string;
  timestamp: Date;
  label: string;
  color: string;
}

export type MetricKey = 'pm25' | 'pm10' | 'co2' | 'voc';

export const METRIC_CONFIG: Record<MetricKey, { label: string; unit: string; color: string }> = {
  pm25: { label: 'PM2.5', unit: 'µg/m³', color: '#3b82f6' },
  pm10: { label: 'PM10', unit: 'µg/m³', color: '#8b5cf6' },
  co2: { label: 'CO2', unit: 'ppm', color: '#10b981' },
  voc: { label: 'VOC', unit: 'ppb', color: '#f59e0b' },
};
