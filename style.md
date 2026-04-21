"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./job-detail.module.css";

type JobStatus = "queued" | "processing" | "completed" | "failed" | "unknown";

type JobApiResponse = {
  ok?: boolean;
  jobId: string;
  status: JobStatus;
  createdAt?: string;
  updatedAt?: string;
  message?: string;
  payload?: unknown;
  error?: string | { message?: string; [key: string]: unknown };
};

type JobDetailClientProps = {
  jobId: string;
};

const POLL_INTERVAL_MS = 30_000;

function formatDateTime(value: string | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function getStatusTone(status: JobStatus): string {
  switch (status) {
    case "completed":
      return styles.statusCompleted;
    case "failed":
      return styles.statusFailed;
    case "processing":
      return styles.statusProcessing;
    case "queued":
      return styles.statusQueued;
    default:
      return styles.statusUnknown;
  }
}

function getStatusLabel(status: JobStatus): string {
  switch (status) {
    case "queued":
      return "Queued";
    case "processing":
      return "Processing";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    default:
      return "Unknown";
  }
}

export default function JobDetailClient({ jobId }: JobDetailClientProps) {
  const [job, setJob] = useState<JobApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageError, setPageError] = useState<string>("");
  const [lastCheckedAt, setLastCheckedAt] = useState<string>("");

  const pollingRef = useRef<number | null>(null);

  const isTerminal = useMemo(() => {
    return job?.status === "completed" || job?.status === "failed";
  }, [job?.status]);

  const fetchJob = useCallback(
    async (showLoadingState = false) => {
      if (showLoadingState) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const response = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, {
          method: "GET",
          cache: "no-store"
        });

        const json = (await response.json()) as JobApiResponse;

        if (!response.ok) {
          const derivedError =
            typeof json?.error === "string"
              ? json.error
              : json?.error?.message || `Failed to load job details (${response.status}).`;

          setPageError(derivedError);
          return;
        }

        setJob(json);
        setPageError("");
        setLastCheckedAt(new Date().toISOString());
      } catch {
        setPageError("Unable to load the latest job status.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [jobId]
  );

  useEffect(() => {
    void fetchJob(true);
  }, [fetchJob]);

  useEffect(() => {
    if (isTerminal) {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    pollingRef.current = window.setInterval(() => {
      void fetchJob(false);
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [fetchJob, isTerminal]);

  const payloadJson = useMemo(() => {
    if (!job?.payload || job.status !== "completed") return null;
    return JSON.stringify(job.payload, null, 2);
  }, [job]);

  const errorText = useMemo(() => {
    if (!job?.error) return null;
    if (typeof job.error === "string") return job.error;
    return job.error.message ?? JSON.stringify(job.error, null, 2);
  }, [job?.error]);

  return (
    <section className={`card ${styles.jobPageCard}`} aria-labelledby="job-detail-title">
      <div className={styles.headerRow}>
        <div>
          <p className={styles.eyebrow}>Job details</p>
          <h1 className="title" id="job-detail-title">
            Processing Status
          </h1>
          <p className="subtitle">
            Track the current state of your submitted job and review the final payload once processing completes.
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={() => void fetchJob(false)}
          disabled={isLoading || isRefreshing}
        >
          {isRefreshing ? "Refreshing..." : "Refresh now"}
        </button>
      </div>

      {pageError ? (
        <section className={styles.alertCard} aria-live="polite">
          <h2 className={styles.sectionTitle}>Unable to load job</h2>
          <p className="error-text">{pageError}</p>
        </section>
      ) : null}

      <section className={styles.statusCard} aria-live="polite">
        <div className={styles.statusHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Job summary</h2>
            <p className={styles.sectionHint}>This page refreshes automatically every 30 seconds until the job finishes.</p>
          </div>

          <span className={`${styles.statusBadge} ${getStatusTone(job?.status ?? "unknown")}`}>
            {getStatusLabel(job?.status ?? "unknown")}
          </span>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingBar} />
            <div className={styles.loadingBarShort} />
          </div>
        ) : (
          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Job ID</span>
              <span className={styles.metaValueMono}>{job?.jobId ?? jobId}</span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Created</span>
              <span className={styles.metaValue}>{formatDateTime(job?.createdAt)}</span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Updated</span>
              <span className={styles.metaValue}>{formatDateTime(job?.updatedAt)}</span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Last checked</span>
              <span className={styles.metaValue}>{formatDateTime(lastCheckedAt)}</span>
            </div>
          </div>
        )}

        {job?.message ? <p className={styles.statusMessage}>{job.message}</p> : null}
      </section>

      {job?.status === "failed" ? (
        <section className={styles.resultCard}>
          <h2 className={styles.sectionTitle}>Failure details</h2>
          <p className="error-text">{errorText ?? "The job failed, but no additional error details were returned."}</p>
        </section>
      ) : null}

      {job?.status === "completed" ? (
        <section className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Completed payload</h2>
              <p className={styles.sectionHint}>The final payload is shown below once the job reaches the completed state.</p>
            </div>
          </div>

          {payloadJson ? (
            <pre className={styles.payloadBlock}>{payloadJson}</pre>
          ) : (
            <p className="hint">The job completed, but no payload was returned.</p>
          )}
        </section>
      ) : null}
    </section>
  );
}



&&&&&&&&&&&&

.jobPageCard {
    display: grid;
    gap: 1rem;
  }
  
  .headerRow {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .eyebrow {
    margin: 0 0 0.35rem;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9a4e12;
  }
  
  .refreshButton {
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-primary);
    padding: 0.65rem 0.9rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    white-space: nowrap;
  }
  
  .refreshButton:hover:not(:disabled) {
    border-color: var(--accent);
    box-shadow: 0 6px 18px rgba(243, 124, 32, 0.12);
  }
  
  .refreshButton:disabled {
    opacity: 0.75;
    cursor: not-allowed;
  }
  
  .alertCard,
  .statusCard,
  .resultCard {
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface-muted);
    padding: 1rem;
  }
  
  .statusHeader,
  .resultHeader {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 0.9rem;
  }
  
  .sectionTitle {
    margin: 0 0 0.3rem;
    font-size: 1rem;
    color: var(--text-primary);
  }
  
  .sectionHint {
    margin: 0;
    font-size: 0.88rem;
    color: var(--text-secondary);
  }
  
  .statusBadge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2rem;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 700;
    border: 1px solid transparent;
  }
  
  .statusQueued {
    background: #fff7ed;
    color: #9a3412;
    border-color: #fdba74;
  }
  
  .statusProcessing {
    background: #eff6ff;
    color: #1d4ed8;
    border-color: #93c5fd;
  }
  
  .statusCompleted {
    background: #ecfdf3;
    color: #027a48;
    border-color: #86efac;
  }
  
  .statusFailed {
    background: #fef3f2;
    color: #b42318;
    border-color: #fda29b;
  }
  
  .statusUnknown {
    background: #f4f4f5;
    color: #52525b;
    border-color: #d4d4d8;
  }
  
  .metaGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem;
  }
  
  .metaItem {
    display: grid;
    gap: 0.25rem;
    padding: 0.85rem 0.9rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
  }
  
  .metaLabel {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-secondary);
  }
  
  .metaValue {
    font-size: 0.95rem;
    color: var(--text-primary);
  }
  
  .metaValueMono {
    font-family: ui-monospace, SFMono-Regular, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace;
    font-size: 0.92rem;
    color: var(--text-primary);
    word-break: break-all;
  }
  
  .statusMessage {
    margin: 0.95rem 0 0;
    font-size: 0.92rem;
    color: var(--text-secondary);
  }
  
  .payloadBlock {
    margin: 0;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 0.84rem;
    line-height: 1.5;
    background: #fffaf5;
    border: 1px solid #ffd7b8;
    border-radius: 10px;
    padding: 1rem;
  }
  
  .loadingState {
    display: grid;
    gap: 0.75rem;
  }
  
  .loadingBar,
  .loadingBarShort {
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      rgba(243, 124, 32, 0.08) 0%,
      rgba(243, 124, 32, 0.18) 50%,
      rgba(243, 124, 32, 0.08) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.4s linear infinite;
  }
  
  .loadingBar {
    height: 14px;
    width: 100%;
  }
  
  .loadingBarShort {
    height: 14px;
    width: 62%;
  }
  
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
  
    100% {
      background-position: -200% 0;
    }
  }
  
  @media (max-width: 720px) {
    .metaGrid {
      grid-template-columns: 1fr;
    }
  }

  &&&&&&&&&

  import JobDetailClient from "./ job-detail-client";

type JobDetailPageProps = {
  params: {
    jobId: string;
  };
};

export default function JobDetailPage({ params }: JobDetailPageProps) {
  return (
    <main>
      <JobDetailClient jobId={params.jobId} />
    </main>
  );
}







