import { useGetRecordings } from "@workspace/api-client-react";
import { Video, Clock, HardDrive } from "lucide-react";
import { Link } from "wouter";

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

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString();
}

export default function RecordingsPage() {
  const { data: recordings, isLoading } = useGetRecordings();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recordings</h1>
        <p className="text-muted-foreground text-sm mt-1">Video evidence captured during emergencies</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : !recordings?.length ? (
        <div className="bg-card border border-card-border rounded-xl py-20 text-center">
          <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No recordings yet</p>
          <p className="text-sm text-muted-foreground mt-1">Recordings are automatically captured when an alert is triggered</p>
        </div>
      ) : (
        <div className="bg-card border border-card-border rounded-xl divide-y divide-border">
          {recordings.map((rec) => (
            <div
              key={rec.id}
              data-testid={`card-recording-${rec.id}`}
              className="px-5 py-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{rec.filename ?? `Recording ${rec.id.slice(0, 8)}`}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatDuration(rec.duration)}
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" /> {formatSize(rec.size)}
                  </span>
                  <span>{formatTimestamp(rec.createdAt as string)}</span>
                </div>
              </div>
              <Link href={`/alerts/${rec.alertId}`}>
                <a
                  data-testid={`link-alert-recording-${rec.id}`}
                  className="text-xs text-primary hover:underline font-medium shrink-0"
                >
                  View Alert
                </a>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
