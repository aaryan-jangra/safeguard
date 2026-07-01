import { useGetDashboardSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { AlertTriangle, MapPin, Video, Radio, Clock, ExternalLink } from "lucide-react";
import type { ElementType } from "react";
import { cn } from "@/lib/utils";

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString();
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
}: {
  label: string;
  value: string | number;
  icon: ElementType;
  accent?: string;
  sub?: string;
}) {
  return (
    <div
      data-testid={`card-stat-${label.toLowerCase().replace(/\s/g, "-")}`}
      className="bg-card border border-card-border rounded-xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <div className={cn("p-2 rounded-lg", accent ?? "bg-muted")}>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

const activityTypeStyle: Record<string, { dot: string; label: string }> = {
  alert: { dot: "bg-destructive", label: "Alert" },
  location: { dot: "bg-primary", label: "Location" },
  recording: { dot: "bg-chart-4", label: "Recording" },
};

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity(
    { limit: 15 },
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time safety monitoring dashboard</p>
      </div>

      {/* Stats */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl p-5 h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active Alerts"
            value={summary?.activeAlerts ?? 0}
            icon={AlertTriangle}
            accent={summary?.activeAlerts ? "bg-destructive/10" : "bg-muted"}
            sub={`${summary?.totalAlerts ?? 0} total`}
          />
          <StatCard
            label="Tracking Status"
            value={summary?.isTracking ? "Online" : "Offline"}
            icon={Radio}
            accent={summary?.isTracking ? "bg-primary/10" : "bg-muted"}
            sub={summary?.lastSeenAt ? `Last seen ${formatTimestamp(summary.lastSeenAt as string)}` : "No data"}
          />
          <StatCard
            label="Resolved Alerts"
            value={summary?.resolvedAlerts ?? 0}
            icon={AlertTriangle}
            sub="Successfully handled"
          />
          <StatCard
            label="Recordings"
            value={summary?.totalRecordings ?? 0}
            icon={Video}
            sub="Video evidence captured"
          />
        </div>
      )}

      {/* Last location */}
      {summary?.lastLocation && (
        <div className="bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm">Last Known Location</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm text-foreground">
                {(summary.lastLocation as { latitude: number; longitude: number }).latitude.toFixed(4)},{" "}
                {(summary.lastLocation as { latitude: number; longitude: number }).longitude.toFixed(4)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Updated {formatTimestamp((summary.lastLocation as { timestamp: string }).timestamp)}
              </p>
            </div>
            <a
              data-testid="link-map-last-location"
              href={`https://www.google.com/maps?q=${(summary.lastLocation as { latitude: number; longitude: number }).latitude},${(summary.lastLocation as { latitude: number; longitude: number }).longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
            >
              View on Map <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Activity feed */}
      <div className="bg-card border border-card-border rounded-xl">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-card-border">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Recent Activity</h2>
        </div>
        {activityLoading ? (
          <div className="p-5 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-muted mt-1.5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : !activity?.length ? (
          <div className="px-5 py-10 text-center">
            <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No activity recorded yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {activity.map((item) => {
              const style = activityTypeStyle[item.type] ?? activityTypeStyle.location;
              return (
                <li
                  key={item.id}
                  data-testid={`item-activity-${item.id}`}
                  className="flex items-start gap-3 px-5 py-3.5"
                >
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", style.dot)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {style.label} · {formatTimestamp(item.timestamp as string)}
                    </p>
                  </div>
                  {item.latitude && item.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
