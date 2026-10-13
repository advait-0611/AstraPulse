
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { api, normalizeWorkers } from "../services/api";

import Sidebar from "../components/Sidebar";
import WorkspaceHeader from "../components/WorkspaceHeader";

const OverviewPage      = lazy(() => import("./OverviewPage"));
const LiveMonitorPage   = lazy(() => import("./LiveMonitorPage"));
const WorkersPage       = lazy(() => import("./WorkersPage"));
const RequestsPage      = lazy(() => import("./RequestsPage"));
const SchedulingPage    = lazy(() => import("./SchedulingPage"));
const TestingPage       = lazy(() => import("./TestingPage"));
const ShockwavePage     = lazy(() => import("./ShockwavePage"));
const AnalyticsPage     = lazy(() => import("./AnalyticsPage"));
const CostsPage         = lazy(() => import("./CostsPage"));
const AlertsPage        = lazy(() => import("./AlertsPage"));



export default function Dashboard() {
  /* ── Navigation ─────────────────────────────────── */
  const [activePage, setActivePage]   = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("astrapulse-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("astrapulse-theme", theme);
  }, [theme]);

  /* ── Core state ─────────────────────────────────── */
  const [health, setHealth]           = useState("checking");
  const [workers, setWorkers]         = useState([]);
  const [metrics, setMetrics]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [refreshing, setRefreshing]   = useState(false);
  const refreshInFlight               = useRef(false);
  const previousWorkers               = useRef([]);
  const [changedWorkerIds, setChangedWorkerIds] = useState([]);

  /* ── Routing state ──────────────────────────────── */
  const [routeResult, setRouteResult] = useState(null);
  const [routing, setRouting]         = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");

  /* ── 3D animation state ─────────────────────────── */
  // routeAnim: { workerIndex, workerCount, progress (0..1), targetWorkerId }
  const [routeAnim, setRouteAnim]     = useState(null);
  const [scenarioPaused, setScenarioPaused] = useState(false);
  const routeAnimTimer                = useRef(null);

  /* ── Benchmark state ────────────────────────────── */
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [benchmarking, setBenchmarking]       = useState(false);

  /* ── Scenario / Lab state ───────────────────────── */
  const [scenarioCatalog, setScenarioCatalog]   = useState([]);
  const [scenarioId, setScenarioId]             = useState("burst");
  const [scenarioResult, setScenarioResult]     = useState(null);
  const [scenarioRunning, setScenarioRunning]   = useState(false);
  const [automatedLabResult, setAutomatedLabResult] = useState(null);
  const [automatedLabRunning, setAutomatedLabRunning] = useState(false);

  /* ── Worker lifecycle state ─────────────────────── */
  const [workerAction, setWorkerAction] = useState("");
  const [newWorker, setNewWorker] = useState({
    worker_id: "worker-demo",
    name: "Demo Worker",
    capacity: 2,
    service_rate: 1,
    cost_per_service_ms: 0.002,
  });

  /* ── Request form state ─────────────────────────── */
  const [requestForm, setRequestForm] = useState({
    request_id: "req-001",
    model: "llama-3-8b",
    input_tokens: 500,
    output_tokens: 200,
    arrival_time_ms: 0,
    deadline_ms: 2000,
    deadline_mode: "soft",
    policy: "astrapulse",
  });

  /* ── Benchmark form state ───────────────────────── */
  const [benchmarkForm, setBenchmarkForm] = useState({
    request_count: 100,
    seed: 42,
    workload_profile: "mixed",
  });

  /* ── Load dashboard data ────────────────────────── */
  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const [healthData, workersData, metricsData] = await Promise.all([
        api.health(),
        api.workers(),
        api.metrics(),
      ]);

      setHealth(healthData.status === "ok" ? "online" : "offline");
      const nextWorkers = normalizeWorkers(workersData);

      const previousById = new Map(
        previousWorkers.current.map(w => [w.worker_id, w])
      );
      const changedIds = nextWorkers
        .filter(w => {
          const prev = previousById.get(w.worker_id);
          return (
            prev &&
            ["status", "active_slots", "queued_requests", "available_at_ms"].some(
              f => prev[f] !== w[f]
            )
          );
        })
        .map(w => w.worker_id);

      setChangedWorkerIds(changedIds);
      previousWorkers.current = nextWorkers;
      setWorkers(nextWorkers);
      setMetrics(metricsData);
    } catch (err) {
      setHealth("offline");
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      refreshInFlight.current = false;
    }
  }, []);

  /* ── Auto-poll ──────────────────────────────────── */
  useEffect(() => {
    loadDashboard();
    api.scenarios().then(setScenarioCatalog).catch(() => {});
    const interval = setInterval(() => loadDashboard(true), 5000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  /* ── Changed worker highlight timer ─────────────── */
  useEffect(() => {
    if (!changedWorkerIds.length) return;
    const t = setTimeout(() => setChangedWorkerIds([]), 1200);
    return () => clearTimeout(t);
  }, [changedWorkerIds]);

  /* ── Stale selected worker guard ────────────────── */
  useEffect(() => {
    if (selectedWorkerId && !workers.some(w => w.worker_id === selectedWorkerId)) {
      setSelectedWorkerId("");
    }
  }, [selectedWorkerId, workers]);

  /* ── Route result → 3D animation ────────────────── */
  useEffect(() => {
    if (!routeResult?.selected_worker || !workers.length) return;

    setSelectedWorkerId(routeResult.selected_worker);
    const idx = workers.findIndex(w => w.worker_id === routeResult.selected_worker);
    if (idx === -1) return;

    // Animate pulse from 0 → 1 over 1.2 seconds
    const DURATION = 1200;
    const START    = performance.now();
    clearTimeout(routeAnimTimer.current);

    function tick() {
      const elapsed  = performance.now() - START;
      const progress = Math.min(elapsed / DURATION, 1);
      setRouteAnim({
        workerIndex: idx,
        workerCount: workers.length,
        progress,
        targetWorkerId: routeResult.selected_worker,
      });
      if (progress < 1) {
        routeAnimTimer.current = requestAnimationFrame(tick);
      } else {
        // Hold "arrived" state briefly then clear
        routeAnimTimer.current = setTimeout(() => setRouteAnim(null), 600);
      }
    }
    routeAnimTimer.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(routeAnimTimer.current);
      clearTimeout(routeAnimTimer.current);
    };
  }, [routeResult]);  // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Worker actions ─────────────────────────────── */
  async function addWorker(event) {
    event.preventDefault();
    setWorkerAction("add");
    setError("");
    try {
      await api.addWorker({
        ...newWorker,
        capacity: Number(newWorker.capacity),
        service_rate: Number(newWorker.service_rate),
        cost_per_service_ms: Number(newWorker.cost_per_service_ms),
      });
      await loadDashboard(true);
    } catch (err) {
      setError(err.message || "Unable to add worker.");
    } finally {
      setWorkerAction("");
    }
  }

  async function updateWorkerStatus(workerId, status) {
    setWorkerAction(workerId);
    setError("");
    try {
      await api.updateWorkerStatus(workerId, status);
      await loadDashboard(true);
    } catch (err) {
      setError(err.message || "Unable to update worker status.");
    } finally {
      setWorkerAction("");
    }
  }

  async function removeWorker(workerId) {
    setWorkerAction(workerId);
    setError("");
    try {
      await api.removeWorker(workerId);
      await loadDashboard(true);
      if (selectedWorkerId === workerId) setSelectedWorkerId("");
    } catch (err) {
      setError(err.message || "Unable to remove worker.");
    } finally {
      setWorkerAction("");
    }
  }

  async function resetWorkers() {
    setWorkerAction("reset");
    setError("");
    try {
      await api.resetWorkers();
      setRouteResult(null);
      setSelectedWorkerId("");
      setRouteAnim(null);
      await loadDashboard(true);
    } catch (err) {
      setError(err.message || "Unable to reset workers.");
    } finally {
      setWorkerAction("");
    }
  }

  /* ── Routing ────────────────────────────────────── */
  function updateRequestForm(event) {
    const { name, value } = event.target;
    const numericFields = ["input_tokens", "output_tokens", "arrival_time_ms", "deadline_ms"];
    setRequestForm(curr => ({
      ...curr,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  }

  async function submitRoute(event) {
    if (event && event.preventDefault) event.preventDefault();
    setRouting(true);
    setError("");
    setRouteResult(null);
    try {
      const result = await api.route(
        event?.preventDefault ? requestForm : event
      );
      setRouteResult(result);
      await loadDashboard(true);
    } catch (err) {
      setError(err.message || "Routing request failed.");
    } finally {
      setRouting(false);
    }
  }

  // Direct route for Overview quick-form (no synthetic event)
  async function directRoute(payload) {
    setRouting(true);
    setError("");
    setRouteResult(null);
    try {
      const result = await api.route(payload);
      setRouteResult(result);
      await loadDashboard(true);
    } catch (err) {
      setError(err.message || "Routing request failed.");
    } finally {
      setRouting(false);
    }
  }

  /* ── Benchmark ──────────────────────────────────── */
  function updateBenchmarkForm(event) {
    const { name, value } = event.target;
    const numericFields = ["request_count", "seed"];
    setBenchmarkForm(curr => ({
      ...curr,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  }

  async function runBenchmark(event) {
    event.preventDefault();
    setBenchmarking(true);
    setError("");
    setBenchmarkResult(null);
    try {
      const result = await api.benchmark({
        ...benchmarkForm,
        policies: ["astrapulse", "round_robin", "least_loaded"],
      });
      setBenchmarkResult(result);
      await loadDashboard(true);
    } catch (err) {
      setError(err.message || "Benchmark failed.");
    } finally {
      setBenchmarking(false);
    }
  }

  /* ── Scenarios ──────────────────────────────────── */
  async function runScenario(event) {
    const id = typeof event === "string" ? event : scenarioId;
    if (event && event.preventDefault) event.preventDefault();
    setScenarioRunning(true);
    setScenarioResult(null);
    setError("");
    try {
      const result = await api.runScenario(id, {
        seed: 42,
        request_count: 6,
        policy: "astrapulse",
      });
      setScenarioResult(result);
      await loadDashboard(true);
    } catch (err) {
      setError(err.message || "Scenario execution failed.");
    } finally {
      setScenarioRunning(false);
    }
  }

  async function runAutomatedLab() {
    setAutomatedLabRunning(true);
    setAutomatedLabResult(null);
    setError("");
    try {
      setAutomatedLabResult(await api.runAutomatedLab({ seed: 42, request_count: 6 }));
    } catch (err) {
      setError(err.message || "Automated lab execution failed.");
    } finally {
      setAutomatedLabRunning(false);
    }
  }

  /* ── Render pages ───────────────────────────────── */
  function renderPage() {
    switch (activePage) {
      case "overview":
        return (
          <OverviewPage
            workers={workers}
            metrics={metrics}
            routeResult={routeResult}
            routing={routing}
            onRoute={directRoute}
            selectedWorkerId={selectedWorkerId}
            onSelectWorker={setSelectedWorkerId}
            routeAnim={routeAnim}
            onPauseToggle={() => setScenarioPaused(p => !p)}
            scenarioPaused={scenarioPaused}
            scenarioCatalog={scenarioCatalog}
            onRunScenario={runScenario}
            scenarioRunning={scenarioRunning}
            scenarioResult={scenarioResult}
          />
        );
      case "live":
        return (
          <LiveMonitorPage
            workers={workers}
            metrics={metrics}
            routeResult={routeResult}
            loading={loading}
            refreshing={refreshing}
          />
        );
      case "workers":
        return (
          <WorkersPage
            workers={workers}
            changedWorkerIds={changedWorkerIds}
            selectedWorkerId={selectedWorkerId}
            routeResult={routeResult}
            onSelect={setSelectedWorkerId}
            onUpdateStatus={updateWorkerStatus}
            onRemove={removeWorker}
            onAddWorker={addWorker}
            onResetWorkers={resetWorkers}
            busyWorkerId={workerAction}
            newWorker={newWorker}
            onNewWorkerChange={(field, value) =>
              setNewWorker(n => ({ ...n, [field]: value }))
            }
            loading={loading}
          />
        );
      case "requests":
        return (
          <RequestsPage
            requestForm={requestForm}
            onUpdateRequestForm={updateRequestForm}
            onSubmitRoute={submitRoute}
            routing={routing}
            routeResult={routeResult}
          />
        );
      case "scheduling":
        return (
          <SchedulingPage
            benchmarkForm={benchmarkForm}
            onUpdateBenchmarkForm={updateBenchmarkForm}
            onRunBenchmark={runBenchmark}
            benchmarking={benchmarking}
            benchmarkResult={benchmarkResult}
          />
        );
      case "testing":
        return (
          <TestingPage
            scenarioCatalog={scenarioCatalog}
            scenarioId={scenarioId}
            onSetScenarioId={setScenarioId}
            onRunScenario={runScenario}
            scenarioRunning={scenarioRunning}
            scenarioResult={scenarioResult}
            onRunAutomatedLab={runAutomatedLab}
            automatedLabRunning={automatedLabRunning}
            automatedLabResult={automatedLabResult}
          />
        );
      case "shockwave":
        return <ShockwavePage workers={workers} />;
      case "analytics":
        return <AnalyticsPage benchmarkResult={benchmarkResult} metrics={metrics} />;
      case "costs":
        return <CostsPage benchmarkResult={benchmarkResult} metrics={metrics} />;
      case "alerts":
        return <AlertsPage health={health} error={error} workers={workers} />;
      default:
        return (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <p className="empty-state-title">Page not found</p>
          </div>
        );
    }
  }

  return (
    <>
      <Sidebar
        activePage={activePage}
        onNavigate={page => {
          setActivePage(page);
          setError("");
        }}
        health={health}
        sidebarOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
      />

      <div className="main-content">
        <WorkspaceHeader
          activePage={activePage}
          health={health}
          theme={theme}
          onToggleTheme={() => setTheme(current => current === "light" ? "dark" : "light")}
          refreshing={refreshing}
          onRefresh={() => loadDashboard(true)}
        />

        <main
          className={`page${activePage === "overview" ? " page-3d" : ""}`}
          id="main-content"
        >
          {error && (
            <div className="error-banner" role="alert">
              <strong>Error:</strong> {error}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => loadDashboard(true)}
                style={{ marginLeft: "auto" }}
              >
                Retry
              </button>
            </div>
          )}

          <Suspense
            fallback={
              <div className="loading-panel" role="status">
                <div className="spinner" />
                Loading page…
              </div>
            }
          >
            {renderPage()}
          </Suspense>
        </main>
      </div>
    </>
  );
}
