import { useEffect, useState } from "react";
import { getDashboardSummary } from "../services/api";

function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const result = await getDashboardSummary();
        setDashboardData(result.data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <p style={{ padding: "1rem" }}>Loading dashboard...</p>;
  }

  if (error) {
    return <p style={{ padding: "1rem", color: "red" }}>{error}</p>;
  }

  if (!dashboardData) {
    return <p style={{ padding: "1rem" }}>No dashboard data available.</p>;
  }

  const { projectSummary, prioritySummary, activeSprint } = dashboardData;

  const pageStyle = {
    padding: "1.5rem",
    maxWidth: "1000px",
    margin: "0 auto",
  };

  const sectionStyle = {
    marginBottom: "2rem",
  };

  const panelStyle = {
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "1.25rem",
    backgroundColor: "#e5e7eb",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
  };

  const panelTitleStyle = {
    marginTop: 0,
    marginBottom: "0.25rem",
    color: "#1f2937",
  };

  const panelSubtitleStyle = {
    marginTop: 0,
    color: "#475569",
  };

  const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  };

  const smallGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  };

  const statCardStyle = {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "1rem",
  };

  const labelStyle = {
    margin: 0,
    fontSize: "0.9rem",
    color: "#6b7280",
    fontWeight: "500",
  };

  const valueStyle = {
    margin: "0.4rem 0 0 0",
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#111827",
  };

  const sprintInfoStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  };

  const sprintDetailCardStyle = {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "1rem",
  };

  return (
    <div style={pageStyle}>
      <h1
        style={{
          marginTop: "0.5rem",
          marginBottom: "1rem",
          fontSize: "3rem",
          fontWeight: "700",
          color: "#f8fafc",
          textAlign: "center",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}
      >
        Operational Overview
      </h1>

      <p
        style={{
          marginTop: 0,
          marginBottom: "2.5rem",
          color: "#94a3b8",
          textAlign: "center",
          fontSize: "1.05rem",
          lineHeight: 1.6,
        }}
      >
        A centralized view of active sprint progress, workflow distribution, and
        priority alignment.
      </p>

      <section style={sectionStyle}>
        <div style={panelStyle}>
          <h2 style={panelTitleStyle}>Project Overview</h2>
          <p style={panelSubtitleStyle}>
            High-level view of current project work.
          </p>

          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <p style={labelStyle}>Total Items</p>
              <p style={valueStyle}>{projectSummary.totalItems}</p>
            </div>

            <div style={statCardStyle}>
              <p style={labelStyle}>In Progress</p>
              <p style={valueStyle}>{projectSummary.inProgressItems}</p>
            </div>

            <div style={statCardStyle}>
              <p style={labelStyle}>Blocked</p>
              <p style={valueStyle}>{projectSummary.blockedItems}</p>
            </div>

            <div style={statCardStyle}>
              <p style={labelStyle}>Done</p>
              <p style={valueStyle}>{projectSummary.doneItems}</p>
            </div>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={panelStyle}>
          <h2 style={panelTitleStyle}>Current Sprint</h2>
          <p style={panelSubtitleStyle}>
            Current sprint currently marked as active.
          </p>

          {activeSprint ? (
            <div style={sprintInfoStyle}>
              <div style={sprintDetailCardStyle}>
                <p style={labelStyle}>Sprint Name</p>
                <p style={valueStyle}>{activeSprint.name}</p>
              </div>

              <div style={sprintDetailCardStyle}>
                <p style={labelStyle}>Status</p>
                <p style={valueStyle}>{activeSprint.status}</p>
              </div>

              <div style={sprintDetailCardStyle}>
                <p style={labelStyle}>Assigned Items</p>
                <p style={valueStyle}>{activeSprint.itemCount}</p>
              </div>
            </div>
          ) : (
            <div style={sprintDetailCardStyle}>
              <p style={{ margin: 0, color: "#475569" }}>
                No active sprint found.
              </p>
            </div>
          )}
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={panelStyle}>
          <h2 style={panelTitleStyle}>Status Breakdown</h2>
          <p style={panelSubtitleStyle}>
            Item counts by workflow stage.
          </p>

          <div style={smallGridStyle}>
            <div style={statCardStyle}>
              <p style={labelStyle}>Backlog</p>
              <p style={valueStyle}>{projectSummary.backlogItems}</p>
            </div>

            <div style={statCardStyle}>
              <p style={labelStyle}>Ready</p>
              <p style={valueStyle}>{projectSummary.readyItems}</p>
            </div>

            <div style={statCardStyle}>
              <p style={labelStyle}>In Progress</p>
              <p style={valueStyle}>{projectSummary.inProgressItems}</p>
            </div>

            <div style={statCardStyle}>
              <p style={labelStyle}>Blocked</p>
              <p style={valueStyle}>{projectSummary.blockedItems}</p>
            </div>

            <div style={statCardStyle}>
              <p style={labelStyle}>Done</p>
              <p style={valueStyle}>{projectSummary.doneItems}</p>
            </div>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={panelStyle}>
          <h2 style={panelTitleStyle}>Priority Breakdown</h2>
          <p style={panelSubtitleStyle}>
            Item counts by assigned priority level.
          </p>

          <div style={smallGridStyle}>
            <div style={statCardStyle}>
              <p style={labelStyle}>Low</p>
              <p style={valueStyle}>{prioritySummary.low}</p>
            </div>

            <div style={statCardStyle}>
              <p style={labelStyle}>Medium</p>
              <p style={valueStyle}>{prioritySummary.medium}</p>
            </div>

            <div style={statCardStyle}>
              <p style={labelStyle}>High</p>
              <p style={valueStyle}>{prioritySummary.high}</p>
            </div>

            <div style={statCardStyle}>
              <p style={labelStyle}>Critical</p>
              <p style={valueStyle}>{prioritySummary.critical}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;