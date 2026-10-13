
import { BarChart3, Play } from "lucide-react";
import BenchmarkChart from "../charts/BenchmarkChart";

function formatPolicy(policy) {
  return policy === "astrapulse" ? "AstraPulse"
    : policy === "round_robin" ? "Round-Robin" : "Least-Loaded";
}

export default function SchedulingPage({
  benchmarkForm,
  onUpdateBenchmarkForm,
  onRunBenchmark,
  benchmarking,
  benchmarkResult,
}) {
  return (
    <div>
      <div className="two-col">
        {/* Benchmark form */}
        <section className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-header">
            <div>
              <div className="panel-title">Benchmark Policies</div>
              <div className="panel-subtitle">Compare routing policies using the same simulated workload.</div>
            </div>
          </div>
          <form onSubmit={onRunBenchmark} className="form-grid">
            <label className="form-label">
              Request Count
              <input type="number" name="request_count" min="1" max="1000" value={benchmarkForm.request_count} onChange={onUpdateBenchmarkForm} required />
              <span className="form-hint">1 to 1000 requests per policy run</span>
            </label>
            <label className="form-label">
              Random Seed
              <input type="number" name="seed" min="0" value={benchmarkForm.seed} onChange={onUpdateBenchmarkForm} required />
              <span className="form-hint">Same seed produces identical workloads</span>
            </label>
            <label className="form-label full-width">
              Workload Profile
              <select name="workload_profile" value={benchmarkForm.workload_profile} onChange={onUpdateBenchmarkForm}>
                <option value="light">Light</option>
                <option value="mixed">Mixed</option>
                <option value="burst">Burst</option>
              </select>
              <span className="form-hint">Light: low tokens. Mixed: varied. Burst: high concurrency.</span>
            </label>
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={benchmarking}
            >
              {benchmarking ? <><div className="spinner sm" /> Running benchmark…</> : <><Play size={14} /> Run Benchmark</>}
            </button>
          </form>

          {benchmarking && (
            <div className="result-box running" role="status">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="spinner sm" />
                Running a deterministic simulated workload…
              </div>
            </div>
          )}
        </section>

        {/* Results */}
        <section className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-header">
            <div>
              <div className="panel-title">Benchmark Results</div>
              <div className="panel-subtitle">Policy performance comparison</div>
            </div>
          </div>

          {!benchmarkResult ? (
            <div className="empty-state">
              <BarChart3 size={36} />
              <p className="empty-state-title">No benchmark run yet</p>
              <p className="empty-state-text">Configure and run a benchmark on the left to see the policy comparison.</p>
            </div>
          ) : (
            <div className="result-box">
              <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: "0.84rem", color: "var(--text-muted)" }}>
                <span><strong style={{ color: "var(--text)" }}>Run ID:</strong> {benchmarkResult.run_id || "—"}</span>
                <span><strong style={{ color: "var(--text)" }}>Requests:</strong> {benchmarkResult.request_count ?? "—"}</span>
              </div>
              {Array.isArray(benchmarkResult.results) && benchmarkResult.results.length > 0 && (
                <>
                  <BenchmarkChart results={benchmarkResult.results} />
                  <div className="table-wrapper benchmark-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Policy</th>
                          <th className="num">Completed</th>
                          <th className="num">Failed</th>
                          <th className="num">P50 / P95 (ms)</th>
                          <th className="num">Throughput (/s)</th>
                          <th className="num">Miss rate</th>
                          <th className="num">Est. cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {benchmarkResult.results.map(r => (
                          <tr key={r.policy}>
                            <td>
                              <strong style={{ color: r.policy === "astrapulse" ? "var(--blue)" : "inherit" }}>
                                {formatPolicy(r.policy)}
                              </strong>
                            </td>
                            <td className="num">{r.completed_requests}</td>
                            <td className="num">{r.failed_requests}</td>
                            <td>{r.p50_latency_ms ?? "—"} / {r.p95_latency_ms ?? "—"} ms</td>
                            <td className="num">{r.throughput?.toFixed(2) ?? "—"} /s</td>
                            <td>{((r.deadline_miss_rate ?? 0) * 100).toFixed(1)}%</td>
                            <td className="num">{r.total_estimated_cost?.toFixed(3) ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {benchmarkResult.results.map(r => (
                    <div key={r.policy} className="policy-result">
                      <h4>{formatPolicy(r.policy)} details</h4>
                      <p>Deadline misses: {r.deadline_misses ?? "—"}</p>
                      <p>Miss rate: {((r.deadline_miss_rate ?? 0) * 100).toFixed(1)}%</p>
                    </div>
                  ))}
                </>
              )}
              {Array.isArray(benchmarkResult.results) && benchmarkResult.results.length === 0 && (
                <p className="result-box-notice">The backend returned no policy results for this run.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
