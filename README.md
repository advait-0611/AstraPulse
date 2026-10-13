<img width="1600" height="816" alt="WhatsApp Image 2026-10-13 at 8 55 54 AM" src="https://github.com/user-attachments/assets/cbded983-1f3e-4bb0-b57c-88c8cf0f0d1e" /># AstraPulse --- Predictive AI Workload Orchestration

AstraPulse is a local hackathon demonstration of **predictive AI
workload orchestration**. It routes simulated AI inference requests
across simulated workers by evaluating predicted completion time, queue
pressure, worker capacity and health, deadlines, and estimated cost.

> **Important:** AstraPulse is a simulation, not a production inference
> platform. It does not run real AI models or use real GPUs. Queueing,
> execution, latency, throughput, deadline outcomes, and costs are
> simulated or estimated. Benchmark results describe the simulation and
> must not be interpreted as measurements of real infrastructure.

## Highlights

-   **Predictive routing:** Estimates queue wait, service time,
    completion time, deadline risk, and cost.
-   **Multi-factor worker evaluation:** Considers queue pressure,
    capacity, service rate, health, deadlines, and estimated cost.
-   **Explainable decisions:** Shows the selected worker, candidate
    information, and scheduling rationale.
-   **Worker lifecycle controls:** Add, update, remove, and reset
    simulated workers, subject to validation and lifecycle rules.
-   **Health-aware routing:** Offline workers remain visible but are
    excluded from new routing decisions.
-   **Policy benchmarking:** Compares AstraPulse, Round-Robin, and
    Least-Loaded on the same seeded workload.
-   **Metrics dashboard:** Reports simulated p50/p95 latency,
    throughput, deadline misses, completed and failed requests, and
    estimated cost.
-   **Repeatable scenarios:** Supports deterministic scenario profiles
    and an automated scenario lab.

## How it works

1.  Receive and validate an inference request and its scheduling
    constraints.
2.  Inspect simulated worker health, capacity, active slots, queue,
    virtual availability, service rate, and estimated cost.
3.  Evaluate candidates by estimating queue wait, service time,
    completion time, deadline risk, and cost.
4.  Select an eligible worker according to the chosen scheduling policy
    and explain the decision.
5.  Simulate execution using the virtual-time model and record the
    outcome.
6.  Compare results against baseline policies under equivalent workload
    conditions.

``` mermaid
flowchart TD
    A[Incoming inference request] --> B[FastAPI request validation]
    B --> C[Worker registry and state monitor]
    C --> D[Candidate and constraint evaluation]
    D --> E[Scheduling policy]
    E --> F[Worker selection and explanation]
    F --> G[Simulated execution and virtual time]
    G --> H[Metrics and benchmark results]
    H --> I[React dashboard]
    G -. updates simulated state .-> C
```

## Scheduling policies

  -----------------------------------------------------------------------
  Policy                              General approach
  ----------------------------------- -----------------------------------
  **AstraPulse**                      Uses multi-factor evaluation and
                                      predicted values to choose an
                                      eligible worker.

  **Round-Robin**                     Distributes requests in sequence
                                      across eligible workers.

  **Least-Loaded**                    Chooses a worker based on its
                                      measured/simulated load.
  -----------------------------------------------------------------------

The benchmark runs the selected policies against the same generated
workload. Results depend on workload profile, request count, seed,
worker configuration, and simulation assumptions.

## Technology stack

  -----------------------------------------------------------------------
  Component                           Technology
  ----------------------------------- -----------------------------------
  Frontend                            React, Vite, CSS

  Backend API                         Python, FastAPI

  Simulation                          In-memory worker registry and
                                      virtual-time workload model

  API documentation                   FastAPI / OpenAPI interactive docs

  Testing                             pytest
  -----------------------------------------------------------------------

No paid APIs, GPUs, deployed inference models, or cloud infrastructure
are required to run the local prototype.
<img width="1600" height="788" alt="WhatsApp Image 2026-10-13 at 8 54 58 AM" src="https://github.com/user-attachments/assets/7a50e362-c006-49e7-9dcf-32ad2c69fdaf" />

<img width="1600" height="782" alt="WhatsApp Image 2026-10-13 at 8 55 29 AM" src="https://github.com/user-attachments/assets/68443637-8271-42f3-8145-e8b4c198ecfd" />

<img width="1600" height="816" alt="WhatsApp Image 2026-10-13 at 8 55 54 AM" src="https://github.com/user-attachments/assets/b952ef9a-71b8-4014-887d-ca77fd913abe" />



## Project structure

``` text
AstraPulse/
├── backend/
│   ├── app/                     # FastAPI application and simulation logic
│   ├── tests/                   # Backend tests
│   └── requirements.txt
├── frontend/
│   ├── src/                     # React application
│   ├── public/                  # Static assets
│   └── package.json
├── docs/
│   ├── api-contract.md          # API request/response contract
│   └── benchmark-methodology.md # Simulation and benchmark methodology
└── README.md
```

## Getting started

### Prerequisites

-   Python 3.10 or newer
-   Node.js and npm
-   Git

### 1. Clone the repository

``` bash
git clone https://github.com/advait-0611/AstraPulse.git
cd AstraPulse
```

### 2. Create a Python environment and install backend dependencies

**Windows PowerShell**

``` powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

**macOS / Linux**

``` bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

### 3. Start the backend

From the repository root, with the environment activated:

``` bash
python -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

-   API base: <http://127.0.0.1:8000>
-   Interactive API docs: <http://127.0.0.1:8000/docs>
-   OpenAPI schema: <http://127.0.0.1:8000/openapi.json>

Keep this terminal running.

### 4. Start the frontend

Open a second terminal:

``` bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually <http://127.0.0.1:5173>. The
frontend is configured to proxy `/api` requests to
`http://127.0.0.1:8000`.

To use a different API origin, set `VITE_API_BASE_URL` before starting
or building the frontend. For example, in PowerShell:

``` powershell
$env:VITE_API_BASE_URL = "http://127.0.0.1:8000"
npm run dev
```

## Demo workflow

1.  Inspect **Worker status** and review the default simulated workers,
    including healthy, degraded, and offline states.
2.  In **Route an inference request**, submit a request and inspect the
    selected worker, candidate workers, predicted
    queue/service/completion times, deadline risk, estimated cost, and
    explanation.
3.  In **Benchmark policies**, choose a workload profile and seed, then
    compare AstraPulse, Round-Robin, and Least-Loaded.
4.  Review simulated p50/p95 latency, throughput, deadline misses,
    completed/failed requests, and estimated cost.
5.  Explain that all predictions and benchmark outputs belong to the
    simulation, not real GPU or cloud measurements.

For reproducible comparisons, use the same workload profile, request
count, seed, and policies.

## Run tests and build

From the repository root, with backend dependencies installed:

``` bash
python -m pytest backend
```

Build the frontend:

``` bash
cd frontend
npm run build
```

Verify these commands in your own checkout before publishing a release.

## API overview

All endpoints and schemas are documented in
[`docs/api-contract.md`](docs/api-contract.md).

  ------------------------------------------------------------------------------------
  Method                  Endpoint                             Purpose
  ----------------------- ------------------------------------ -----------------------
  `GET`                   `/api/health`                        Backend health and
                                                               simulation mode

  `GET`                   `/api/workers`                       Read simulated workers

  `POST`                  `/api/workers`                       Add a simulated worker

  `PATCH`                 `/api/workers/{worker_id}`           Update a worker's
                                                               health state

  `DELETE`                `/api/workers/{worker_id}`           Remove an eligible idle
                                                               worker

  `POST`                  `/api/workers/reset`                 Restore the default
                                                               worker pool and virtual
                                                               clock

  `POST`                  `/api/route`                         Route one inference
                                                               request

  `POST`                  `/api/benchmark`                     Compare scheduling
                                                               policies

  `GET`                   `/api/metrics`                       Read routing metrics
                                                               and latest benchmark

  `GET`                   `/api/scenarios`                     List deterministic
                                                               scenario profiles

  `POST`                  `/api/scenarios/{scenario_id}/run`   Run a scenario

  `POST`                  `/api/scenarios/automated/run`       Run the isolated
                                                               scenario suite

  `GET`                   `/api/scenario-runs`                 List in-memory scenario
                                                               audit records
  ------------------------------------------------------------------------------------

### Example API requests

List workers:

``` bash
curl http://127.0.0.1:8000/api/workers
```

Route a request:

``` bash
curl -X POST http://127.0.0.1:8000/api/route \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "demo-001",
    "model": "llama-3-8b",
    "input_tokens": 500,
    "output_tokens": 200,
    "arrival_time_ms": 0,
    "deadline_ms": 2000,
    "deadline_mode": "soft",
    "policy": "astrapulse"
  }'
```

Run a policy benchmark:

``` bash
curl -X POST http://127.0.0.1:8000/api/benchmark \
  -H "Content-Type: application/json" \
  -d '{
    "workload_profile": "mixed",
    "request_count": 100,
    "seed": 42,
    "policies": ["astrapulse", "round_robin", "least_loaded"]
  }'
```

Use `docs/api-contract.md` as the source of truth for accepted request
fields and response schemas.

## Worker lifecycle and diagnostics

-   Duplicate worker IDs are rejected with `409 Conflict`.
-   Invalid payloads are rejected through FastAPI validation.
-   Offline workers remain visible but are excluded from new routing
    decisions.
-   A worker with assigned or queued simulated work cannot be removed;
    deletion returns `409 Conflict`.
-   Reset restores the default four-worker pool and virtual simulation
    clock. It does not necessarily erase live routing metrics or
    benchmark history.
-   Restarting the backend resets in-memory worker state, routing
    metrics, and benchmark history.
-   Successful `/api/route` responses include `stages` diagnostics for
    validation, candidate evaluation, constraint evaluation, worker
    selection, and simulated execution.
-   If no eligible worker exists, selection and execution are marked
    `not_applicable`. Hard-deadline infeasibility is reported in the
    constraint stage.
-   The automated scenario lab returns `PASS`, `FAIL`, `ERROR`, or
    `UNSUPPORTED`, with expected behavior, actual outcome, and an
    explanation. It continues after individual scenario errors and uses
    isolated registries.

All scenario latency, outcome, and cost values remain simulation
estimates.

## Benchmark methodology

For a fair comparison:

-   Use the same generated workload for each policy.
-   Keep workload profile, request count, seed, and worker conditions
    consistent.
-   Apply the same metric definitions to every policy.
-   Report latency percentiles, throughput, deadline misses,
    completed/failed requests, and estimated cost.

See [`docs/benchmark-methodology.md`](docs/benchmark-methodology.md) for
the project's methodology. A favorable simulated result does not
establish that the same improvement will occur in production.

## Limitations

-   Workers are simulated in memory; no real GPUs or deployed inference
    models are used.
-   Queue delay, completion time, deadline risk, and cost are
    predictions or synthetic estimates.
-   Benchmark latency and throughput are measured within virtual time,
    not real inference execution on hardware.
-   Costs are synthetic estimates, not cloud-provider billing.
-   Worker registry and routing history are in memory.
-   Results depend on workload profile, request count, seed, worker
    configuration, and simulation assumptions.

These limitations are deliberate for a low-cost, repeatable hackathon
demonstration.

## Future scope

-   Calibrate latency predictions against real inference traces.
-   Integrate real model-serving endpoints and worker telemetry.
-   Evaluate larger and distributed worker pools.
-   Explore autoscaling based on queue pressure and demand.
-   Add service-level objectives, energy-aware routing, and
    model-specific policies.
-   Evaluate scheduling decisions with production-like traces and real
    infrastructure.

These are future directions, not claims about current functionality.

## Contributing

Bug reports, suggestions, and contributions are welcome. For scheduling
or benchmark changes, include tests and explain the impact on
reproducibility and policy comparisons.

1.  Create a focused branch.
2.  Make the change and add or update tests.
3.  Run backend tests and the frontend build.
4.  Document changes to API contracts or benchmark methodology.
5.  Open a pull request with a clear summary and test results.

## License

No license has been specified in this README. Add a `LICENSE` file and
update this section before presenting the repository as open-source
software. Without an applicable license, others generally do not receive
the standard permissions to reuse, modify, or redistribute the code.
