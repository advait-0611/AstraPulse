
import {
  Activity,
  BarChart3,
  ChevronRight,
  Cpu,
  DollarSign,
  FlaskConical,
  Gauge,
  GitBranch,
  Layers,
  Menu,
  Radio,
  X,
  Zap,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Monitor",
    items: [
      { id: "overview",   label: "Overview",            icon: Gauge      },
      { id: "live",       label: "Live Monitor",        icon: Activity   },
      { id: "workers",    label: "Workers",             icon: Cpu        },
      { id: "requests",   label: "Incoming Requests",   icon: GitBranch  },
      { id: "scheduling", label: "Scheduling",          icon: Layers     },
    ],
  },
  {
    label: "Lab",
    items: [
      { id: "testing",    label: "Testing Phase",       icon: FlaskConical },
      { id: "shockwave",  label: "Queue Shockwave",     icon: Radio        },
    ],
  },
  {
    label: "Insights",
    items: [
      { id: "analytics",  label: "Analytics",           icon: BarChart3  },
      { id: "costs",      label: "Cost Analysis",       icon: DollarSign },
      { id: "alerts",     label: "Alerts",              icon: Zap        },
    ],
  },
];

export default function Sidebar({
  activePage,
  onNavigate,
  health,
  sidebarOpen,
  onToggle,
}) {
  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? <X size={17} /> : <Menu size={17} />}
      </button>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar${sidebarOpen ? " open" : ""}`}
        aria-label="Application navigation"
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <div className="sidebar-logo-icon" aria-hidden="true">
              <img src="/favicon.svg" alt="" />
            </div>
            <span className="sidebar-product-name">AstraPulse</span>
          </div>
          <div className="sidebar-product-sub">AI Workload Orchestration</div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Main sections">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="sidebar-section-label" aria-hidden="true">
                {section.label}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    className={`sidebar-item${isActive ? " active" : ""}`}
                    onClick={() => {
                      onNavigate(item.id);
                      if (window.innerWidth < 768 && onToggle) onToggle();
                    }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon aria-hidden="true" />
                    <span>{item.label}</span>
                    {isActive && (
                      <ChevronRight
                        size={11}
                        style={{ marginLeft: "auto", opacity: 0.45 }}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-status" role="status" aria-live="polite">
            <span
              className={`sidebar-status-dot${health === "online" ? " online" : ""}`}
              aria-hidden="true"
            />
            <span>
              {health === "checking"
                ? "Connecting…"
                : health === "online"
                ? "Backend online"
                : "Backend offline"}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
