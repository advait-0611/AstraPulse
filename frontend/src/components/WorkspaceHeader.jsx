
import { Moon, RefreshCw, Sun } from "lucide-react";

const PAGE_META = {
  overview:   {
    eyebrow: "Dashboard",
    title: "Overview",
    subtitle: "Monitor worker health, request activity, and scheduling performance.",
  },
  live:       {
    eyebrow: "Real-Time",
    title: "Live Monitor",
    subtitle: "Track virtual time, routing decisions, and worker registry state.",
  },
  workers:    {
    eyebrow: "Infrastructure",
    title: "Workers",
    subtitle: "Inspect worker capacity, utilization, queue pressure, and lifecycle.",
  },
  requests:   {
    eyebrow: "Ingestion",
    title: "Incoming Requests",
    subtitle: "Submit a workload and inspect the scheduler's routing decision.",
  },
  scheduling: {
    eyebrow: "Pipeline",
    title: "Scheduling Decisions",
    subtitle: "Compare scheduling policies with the same reproducible workload.",
  },
  testing:    {
    eyebrow: "Validation",
    title: "Testing Phase",
    subtitle: "Run deterministic scenarios and review isolated simulation results.",
  },
  shockwave:  {
    eyebrow: "Diagnostics",
    title: "Queue Shockwave",
    subtitle: "Observe how simulated traffic pressure changes worker queues.",
  },
  analytics:  {
    eyebrow: "Analysis",
    title: "Analytics",
    subtitle: "Review latency, throughput, and deadline results from benchmark runs.",
  },
  costs:      {
    eyebrow: "Financial",
    title: "Cost Analysis",
    subtitle: "Compare estimated simulation cost per request by policy.",
  },
  alerts:     {
    eyebrow: "Alerts",
    title: "Alerts",
    subtitle: "Review health notifications derived from the current API state.",
  },
};

export default function WorkspaceHeader({
  activePage,
  health,
  theme,
  onToggleTheme,
  refreshing,
  onRefresh,
}) {
  const meta = PAGE_META[activePage] || PAGE_META.overview;

  return (
    <header className="workspace-header" role="banner">
      <div>
        <div className="workspace-breadcrumb">{meta.eyebrow}</div>
        <div className="workspace-title">{meta.title}</div>
      </div>

      <div className="workspace-header-right">
        <div
          className={`api-status-chip${health === "online" ? " online" : ""}`}
          aria-label={`API status: ${health === "checking" ? "connecting" : health}`}
          role="status"
        >
          <span className="status-dot" aria-hidden="true" />
          <span>API {health === "checking" ? "connecting" : health}</span>
        </div>

        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
        >
          {theme === "light" ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
          <span>{theme === "light" ? "Dark" : "Light"}</span>
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label={refreshing ? "Refreshing data" : "Refresh data"}
        >
          <RefreshCw size={13} className={refreshing ? "spin-icon" : ""} aria-hidden="true" />
          {refreshing ? "Refreshing" : "Refresh"}
        </button>
      </div>
    </header>
  );
}
