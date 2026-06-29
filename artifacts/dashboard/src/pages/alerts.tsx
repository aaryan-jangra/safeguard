import { useState } from "react";
import { Link } from "wouter";
import {
  useGetAlerts,
  getGetAlertsQueryKey,
  useUpdateAlert,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, ExternalLink, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type AlertStatus = "all" | "active" | "resolved";

const typeColors: Record<string, string> = {
  sos: "bg-destructive/10 text-destructive border-destructive/20",
  fall: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  tamper: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  manual: "bg-muted text-muted-foreground border-border",
};

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString();
}

export default function AlertsPage() {
  const [filter, setFilter] = useState<AlertStatus>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: alerts, isLoading } = useGetAlerts(
    filter !== "all" ? { status: filter } : undefined,
  );

  const updateAlert = useUpdateAlert({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAlertsQueryKey() });
        toast({ title: "Alert resolved" });
      },
    },
  });

  function handleResolve(alertId: string) {
    updateAlert.mutate({ alertId, data: { status: "resolved" } });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground text-sm mt-1">All emergency events and notifications</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {(["all", "active", "resolved"] as AlertStatus[]).map((s) => (
          <button
            key={s}
            data-testid={`button-filter-${s}`}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize",
              filter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      ) : !alerts?.length ? (
        <div className="bg-card border border-card-border rounded-xl py-16 text-center">
          <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-sm">No alerts found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {filter !== "all" ? `No ${filter} alerts` : "The device has not triggered any alerts yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              data-testid={`card-alert-${alert.id}`}
              className="bg-card border border-card-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase border",
                      typeColors[alert.type] ?? typeColors.manual,
                    )}
                  >
                    {alert.type}
                  </span>
                  {alert.status === "active" && (
                    <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                      Active
                    </span>
                  )}
                  {alert.status === "resolved" && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3" />
                      Resolved
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                </p>
                {alert.message && (
                  <p className="text-sm text-foreground">{alert.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatTimestamp(alert.timestamp as string)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  data-testid={`link-map-alert-${alert.id}`}
                  href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                >
                  Map <ExternalLink className="w-3 h-3" />
                </a>
                <Link href={`/alerts/${alert.id}`}>
                  <a
                    data-testid={`link-detail-alert-${alert.id}`}
                    className="px-3 py-1.5 rounded-md text-xs bg-muted hover:bg-accent hover:text-accent-foreground font-medium transition-colors"
                  >
                    Details
                  </a>
                </Link>
                {alert.status === "active" && (
                  <button
                    data-testid={`button-resolve-alert-${alert.id}`}
                    onClick={() => handleResolve(alert.id)}
                    disabled={updateAlert.isPending}
                    className="px-3 py-1.5 rounded-md text-xs bg-primary text-primary-foreground hover:opacity-90 font-medium transition-opacity disabled:opacity-50"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
