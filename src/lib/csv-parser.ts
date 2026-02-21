import Papa from 'papaparse';
import { SensorReading, MetricKey } from './types';

export function parseCSV(file: File): Promise<SensorReading[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        const readings: SensorReading[] = results.data.map((row: any) => {
          // Flexible timestamp mapping
          const timeStr = row.Timestamp || row.timestamp || row.Date || row.time;
          const timestamp = new Date(timeStr);
          
          return {
            timestamp,
            pm25: row['PM2.5'] || row.pm25 || row.PM25,
            pm10: row['PM10'] || row.pm10 || row.PM10,
            co2: row['CO2'] || row.co2 || row.CO2,
            voc: row['VOC'] || row.voc || row.VOC,
            ...row
          };
        }).filter((r: SensorReading) => !isNaN(r.timestamp.getTime()));
        
        resolve(readings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
      },
      error: (error: Error) => reject(error)
    });
  });
}

export function computeStats(data: SensorReading[]) {
  const keys: MetricKey[] = ['pm25', 'pm10', 'co2', 'voc'];
  return keys.map(key => {
    const values = data.map(d => d[key]).filter((v): v is number => typeof v === 'number');
    if (values.length === 0) return null;
    return {
      metric: key,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      max: Math.max(...values),
      min: Math.min(...values),
      count: values.length
    };
  });
}
