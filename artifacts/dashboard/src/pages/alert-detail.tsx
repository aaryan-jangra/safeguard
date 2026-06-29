import { Link } from "wouter";
import {
  useGetAlert,
  getGetAlertQueryKey,
  useGetRecordings,
  useUpdateAlert,
  getGetAlertsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Video, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const typeColors: Record<string, string> = {
  sos: "bg-destructive/10 text-destructive border-destructive/20",
  fall: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  tamper: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  manual: "bg-muted text-muted-foreground border-border",
};

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AlertDetailPageProps {
  alertId: string;
}

export default function AlertDetailPage({ alertId }: AlertDetailPageProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: alert, isLoading } = useGetAlert(alertId, {
    query: { enabled: !!alertId, queryKey: getGetAlertQueryKey(alertId) },
  });

  const { data: recordings } = useGetRecordings();
  const linkedRecordings = recordings?.filter((r) => r.alertId === alertId) ?? [];

  const updateAlert = useUpdateAlert({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAlertQueryKey(alertId) });
        queryClient.invalidateQueries({ queryKey: getGetAlertsQueryKey() });
        toast({ title: "Alert resolved" });
      },
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-32" />
        <div className="bg-card border border-card-border rounded-xl p-6 h-40" />
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-muted-foreground">Alert not found.</p>
        <Link href="/alerts">
          <a className="text-primary text-sm hover:underline mt-2 inline-block">Back to Alerts</a>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/alerts">
          <a data-testid="link-back-alerts" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </a>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Alert Detail</h1>
      </div>

      {/* Alert card */}
      <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold uppercase border",
              typeColors[alert.type] ?? typeColors.manual,
            )}
          >
            {alert.type}
          </span>
          {alert.status === "active" && (
            <span className="flex items-center gap-1.5 text-sm text-destructive font-medium">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              Active
            </span>
          )}
          {alert.status === "resolved" && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
              Resolved
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wider mb-1">Triggered</p>
            <p data-testid="text-alert-timestamp">{new Date(alert.timestamp as string).toLocaleString()}</p>
          </div>
          {alert.resolvedAt && (
            <div>
              <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wider mb-1">Resolved</p>
              <p>{new Date(alert.resolvedAt as string).toLocaleString()}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wider mb-1">Coordinates</p>
            <p data-testid="text-alert-coords" className="font-mono">
              {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
            </p>
          </div>
          <div>
            <a
              data-testid="link-map-alert-detail"
              href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-primary text-sm hover:underline font-medium mt-4"
            >
              View on Map <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {alert.message && (
          <div>
            <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wider mb-1">Message</p>
            <p className="text-sm">{alert.message}</p>
          </div>
        )}

        {alert.status === "active" && (
          <button
            data-testid="button-resolve-alert-detail"
            onClick={() => updateAlert.mutate({ alertId, data: { status: "resolved" } })}
            disabled={updateAlert.isPending}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {updateAlert.isPending ? "Resolving..." : "Mark as Resolved"}
          </button>
        )}
      </div>

      {/* Linked recordings */}
      <div className="bg-card border border-card-border rounded-xl">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-card-border">
          <Video className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Linked Recordings</h2>
          <span className="ml-auto text-xs text-muted-foreground">{linkedRecordings.length}</span>
        </div>
        {linkedRecordings.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Video className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recordings for this alert</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {linkedRecordings.map((rec) => (
              <li key={rec.id} data-testid={`item-recording-${rec.id}`} className="px-5 py-3.5 flex items-center gap-4">
                <Video className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{rec.filename ?? "Recording"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(rec.duration)} · {formatSize(rec.size)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
