
import BenchmarkChart from "../charts/BenchmarkChart";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage({ benchmarkResult, metrics }) {
  const results = benchmarkResult?.results ?? metrics?.latest_benchmark?.results ?? [];

  return (
    <div>
      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-header">
          <div>
            <div className="panel-title">Policy Latency Comparison</div>
            <div className="panel-subtitle">P50 / P95 latency per scheduling policy from the latest benchmark run</div>
          </div>
        </div>
        {results.length === 0 ? (
          <div className="empty-state">
            <BarChart3 size={40} />
            <p className="empty-state-title">No benchmark data available</p>
            <p className="empty-state-text">Run a benchmark from the Scheduling Decisions page to populate analytics charts.</p>
          </div>
        ) : (
          <BenchmarkChart results={results} />
        )}
      </section>

      {results.length > 0 && (
        <div className="two-col">
          <section className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-header">
              <div>
                <div className="panel-title">Throughput Comparison</div>
                <div className="panel-subtitle">Completed requests per simulated second</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
              {results.map(r => {
                const tp = r.throughput ?? 0;
                const maxTp = Math.max(...results.map(x => x.throughput ?? 0), 0.01);
                return (
                  <div key={r.policy}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "0.84rem" }}>
                      <span style={{ color: r.policy === "astrapulse" ? "var(--blue)" : "var(--text-muted)", fontWeight: 600 }}>
                        {r.policy === "astrapulse" ? "AstraPulse" : r.policy === "round_robin" ? "Round-Robin" : "Least-Loaded"}
                      </span>
                      <span style={{ color: "var(--text)", fontWeight: 700 }}>{tp.toFixed(2)} /s</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "var(--line)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        borderRadius: 3,
                        background: r.policy === "astrapulse" ? "var(--blue)" : r.policy === "round_robin" ? "var(--cyan)" : "var(--purple)",
                        width: `${(tp / maxTp) * 100}%`,
                        transition: "width 0.6s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-header">
              <div>
                <div className="panel-title">Deadline Miss Rate</div>
                <div className="panel-subtitle">Percentage of requests that missed their soft deadline</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
              {results.map(r => {
                const miss = (r.deadline_miss_rate ?? 0) * 100;
                return (
                  <div key={r.policy}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "0.84rem" }}>
                      <span style={{ color: r.policy === "astrapulse" ? "var(--blue)" : "var(--text-muted)", fontWeight: 600 }}>
                        {r.policy === "astrapulse" ? "AstraPulse" : r.policy === "round_robin" ? "Round-Robin" : "Least-Loaded"}
                      </span>
                      <span style={{ color: miss > 20 ? "var(--red)" : miss > 10 ? "var(--amber)" : "var(--green)", fontWeight: 700 }}>
                        {miss.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "var(--line)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        borderRadius: 3,
                        background: miss > 20 ? "var(--red)" : miss > 10 ? "var(--amber)" : "var(--green)",
                        width: `${Math.min(miss, 100)}%`,
                        transition: "width 0.6s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {metrics && (
        <section className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-header">
            <div>
              <div className="panel-title">Live Metrics Snapshot</div>
              <div className="panel-subtitle">Current counters from the scheduling pipeline</div>
            </div>
          </div>
          <div className="result-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
            {[
              ["Routing Decisions", metrics.routing_decisions],
              ["Completed Requests", metrics.completed_requests],
              ["Failed Requests", metrics.failed_requests],
              ["Deadline Misses", metrics.deadline_misses],
            ].map(([label, value]) => (
              <div key={label} className="result-value">
                <span>{label}</span>
                <strong>{value ?? "—"}</strong>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
