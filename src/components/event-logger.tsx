import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Clock, Plus, X, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { UserEvent, SensorReading } from '@/lib/types';

interface EventLoggerProps {
  events: UserEvent[];
  onAddEvent: (event: UserEvent) => void;
  onRemoveEvent: (id: string) => void;
  dataRange: { min: Date; max: Date } | null;
}

export const EventLogger: React.FC<EventLoggerProps> = ({ events, onAddEvent, onRemoveEvent, dataRange }) => {
  const [label, setLabel] = useState('');
  const [timestamp, setTimestamp] = useState('');

  const handleAdd = () => {
    if (!label || !timestamp) return;
    onAddEvent({
      id: Math.random().toString(36).substr(2, 9),
      label,
      timestamp: new Date(timestamp),
      color: '#ef4444'
    });
    setLabel('');
  };

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="size-4" /> Event Logger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="event-label" className="text-xs">Label</Label>
          <Input 
            id="event-label"
            value={label} 
            onChange={(e) => setLabel(e.target.value)} 
            placeholder="e.g. Cooking" 
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-time" className="text-xs">Time</Label>
          <Input 
            id="event-time"
            type="datetime-local" 
            value={timestamp} 
            onChange={(e) => setTimestamp(e.target.value)} 
            className="h-8 text-xs"
          />
        </div>
        <Button onClick={handleAdd} className="w-full h-8 text-xs" size="sm">
          <Plus className="size-3 mr-1" /> Add Event
        </Button>

        <div className="pt-4 border-t space-y-2">
          {events.map(event => (
            <div key={event.id} className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded-md">
              <div className="flex flex-col">
                <span className="font-medium">{event.label}</span>
                <span className="text-[10px] text-muted-foreground">{format(event.timestamp, 'HH:mm:ss')}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemoveEvent(event.id)}>
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface DataFileSummaryProps {
  data: SensorReading[];
  fileName: string;
  onReset: () => void;
}

export const DataFileSummary: React.FC<DataFileSummaryProps> = ({ data, fileName, onReset }) => {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
          <FileText size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{fileName}</h3>
          <p className="text-xs text-slate-500">{data.length.toLocaleString()} readings recorded</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onReset} className="text-xs gap-1">
        <Trash2 size={14} /> Reset
      </Button>
    </div>
  );
};
