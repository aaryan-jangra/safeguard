import { useState } from "react";
import { useGetLocationHistory } from "@workspace/api-client-react";
import { MapPin, ExternalLink, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const HOUR_OPTIONS = [1, 6, 12, 24, 48, 72];

export default function LocationPage() {
  const [hours, setHours] = useState(24);
  const { data: history, isLoading } = useGetLocationHistory({ hours });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Location History</h1>
          <p className="text-muted-foreground text-sm mt-1">GPS pings recorded from the safety device</p>
        </div>
        <div className="flex items-center gap-1.5 bg-muted rounded-lg p-1">
          {HOUR_OPTIONS.map((h) => (
            <button
              key={h}
              data-testid={`button-hours-${h}`}
              onClick={() => setHours(h)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                hours === h
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : !history?.length ? (
        <div className="bg-card border border-card-border rounded-xl py-20 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No location data in this window</p>
          <p className="text-sm text-muted-foreground mt-1">The device has not reported GPS coordinates in the last {hours} hours</p>
        </div>
      ) : (
        <div className="bg-card border border-card-border rounded-xl divide-y divide-border">
          <div className="px-5 py-3 text-xs text-muted-foreground font-medium flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> {history.length} pings in the last {hours}h
          </div>
          {history.map((loc) => (
            <div
              key={loc.id}
              data-testid={`row-location-${loc.id}`}
              className="px-5 py-3.5 flex items-center gap-4"
            >
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1">
                <p className="font-mono text-sm text-foreground">
                  {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  {loc.accuracy && <span>±{loc.accuracy.toFixed(0)}m</span>}
                  {loc.speed != null && <span>{(loc.speed * 3.6).toFixed(1)} km/h</span>}
                  {loc.altitude != null && <span>{loc.altitude.toFixed(0)}m alt</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">
                  {new Date(loc.timestamp as string).toLocaleString()}
                </p>
                <a
                  data-testid={`link-map-location-${loc.id}`}
                  href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline font-medium justify-end mt-0.5"
                >
                  Map <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
