import { useEffect, useState } from "react";
import {
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint,
} from "../services/api";

function SprintManagementPage() {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("Planned");

  const [editingSprintId, setEditingSprintId] = useState(null);
  const [expandedSprintId, setExpandedSprintId] = useState(null);
  const [hoveredDeleteId, setHoveredDeleteId] = useState(null);

  const [editName, setEditName] = useState("");
  const [editGoal, setEditGoal] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editStatus, setEditStatus] = useState("Planned");

  const sprintStatusOptions = ["Planned", "Active", "Closed"];

  async function loadSprints() {
    try {
      setLoading(true);
      setError("");

      const data = await getSprints();
      setSprints(data);
    } catch (err) {
      setError("Failed to load sprints.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSprints();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Sprint name is required.");
      return;
    }

    try {
      setError("");

      await createSprint({
        name: name.trim(),
        goal: goal.trim(),
        startDate,
        endDate,
        status,
      });

      setName("");
      setGoal("");
      setStartDate("");
      setEndDate("");
      setStatus("Planned");
      setShowCreateForm(false);

      await loadSprints();
    } catch (err) {
      setError(err.message || "Failed to create sprint.");
    }
  }

  function handleEditStart(sprint) {
    setEditingSprintId(sprint.sprintId);
    setExpandedSprintId(sprint.sprintId);
    setEditName(sprint.name || "");
    setEditGoal(sprint.goal || "");
    setEditStartDate(sprint.startDate || "");
    setEditEndDate(sprint.endDate || "");
    setEditStatus(sprint.status || "Planned");
    setError("");
  }

  function handleEditCancel() {
    setEditingSprintId(null);
    setExpandedSprintId(null);
    setEditName("");
    setEditGoal("");
    setEditStartDate("");
    setEditEndDate("");
    setEditStatus("Planned");
  }

  async function handleEditSave(sprint) {
    if (!editName.trim()) {
      setError("Sprint name is required.");
      return;
    }

    try {
      setError("");

      await updateSprint(sprint.sprintId, {
        name: editName.trim(),
        goal: editGoal.trim(),
        startDate: editStartDate,
        endDate: editEndDate,
        status: editStatus,
        projectId: sprint.projectId,
      });

      handleEditCancel();
      await loadSprints();
    } catch (err) {
      setError(err.message || "Failed to update sprint.");
    }
  }

  async function handleDelete(sprintId) {
    try {
      setError("");
      await deleteSprint(sprintId);
      await loadSprints();
    } catch (err) {
      setError(err.message || "Failed to delete sprint.");
    }
  }

  function toggleExpanded(sprintId) {
    setExpandedSprintId((current) => (current === sprintId ? null : sprintId));
  }

  const pageStyle = {
    padding: "1.5rem",
    maxWidth: "1100px",
    margin: "0 auto",
  };

  const headerTitleStyle = {
    marginTop: "0.5rem",
    marginBottom: "1rem",
    fontSize: "3rem",
    fontWeight: "700",
    color: "#f8fafc",
    textAlign: "center",
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
  };

  const headerSubtitleStyle = {
    marginTop: 0,
    marginBottom: "2.5rem",
    color: "#94a3b8",
    textAlign: "center",
    fontSize: "1.05rem",
    lineHeight: 1.6,
  };

  const panelStyle = {
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "1.25rem",
    backgroundColor: "#e5e7eb",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
    marginBottom: "2rem",
  };

  const panelTitleStyle = {
    marginTop: 0,
    marginBottom: "0.25rem",
    color: "#1f2937",
  };

  const panelSubtitleStyle = {
    marginTop: 0,
    marginBottom: "1rem",
    color: "#475569",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.8rem 0.9rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#f8fafc",
    color: "#111827",
    boxSizing: "border-box",
  };

  const textareaStyle = {
    width: "100%",
    minHeight: "52px",
    padding: "0.8rem 0.9rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#f8fafc",
    color: "#111827",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const primaryButtonStyle = {
    padding: "0.8rem 1rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  };

  const secondaryButtonStyle = {
    padding: "0.55rem 0.8rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#1f2937",
    fontWeight: "600",
    cursor: "pointer",
  };

  const detailsButtonStyle = {
    padding: "0.55rem 0.8rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#eef2f7",
    color: "#334155",
    fontWeight: "600",
    cursor: "pointer",
  };

  const sprintListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginTop: "1rem",
  };

  const sprintCardStyle = {
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    overflow: "hidden",
  };

  const sprintRowStyle = {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 2fr) repeat(3, minmax(120px, 1fr)) auto",
    gap: "1rem",
    alignItems: "center",
    padding: "1rem",
  };

  const sprintRowEditModeStyle = {
    ...sprintRowStyle,
    backgroundColor: "#dbe1e8",
  };

  const itemFieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    textAlign: "left",
  };

  const itemLabelStyle = {
    margin: 0,
    fontSize: "0.8rem",
    color: "#64748b",
    fontWeight: "600",
  };

  const itemValueStyle = {
    margin: 0,
    fontSize: "1rem",
    color: "#0f172a",
    fontWeight: "600",
  };

  const actionsStyle = {
    display: "flex",
    gap: "0.5rem",
    justifyContent: "flex-end",
    flexWrap: "wrap",
  };

  const expandedSectionStyle = {
    padding: "1rem",
    borderTop: "1px solid #d1d5db",
    backgroundColor: "#f1f5f9",
    textAlign: "left",
  };

  const editExpandedStyle = {
    ...expandedSectionStyle,
    backgroundColor: "#dbe1e8",
  };

  const editGridStyle = {
    display: "grid",
    gridTemplateColumns: "1.3fr 1.3fr 1fr 1fr 1fr",
    gap: "0.75rem",
    marginBottom: "0.75rem",
  };

  const editActionRowStyle = {
    display: "flex",
    gap: "0.75rem",
    marginTop: "0.75rem",
  };

  const detailTextStyle = {
    margin: 0,
    color: "#334155",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
  };

  function formatDate(dateValue) {
    if (!dateValue) {
      return "Not set";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString();
  }

  return (
    <div style={pageStyle}>
      <h1 style={headerTitleStyle}>Sprint Management</h1>
      <p style={headerSubtitleStyle}>
        Create, review, and maintain sprint records from a single workspace.
      </p>

      <section style={panelStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <h2 style={panelTitleStyle}>Create Sprint</h2>
            <p style={panelSubtitleStyle}>
              Add a new sprint with dates, goal, and lifecycle status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateForm((current) => !current)}
            style={primaryButtonStyle}
          >
            {showCreateForm ? "Close" : "Add Sprint"}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleSubmit} style={editExpandedStyle}>
            <div style={editGridStyle}>
              <div style={itemFieldStyle}>
                <p style={itemLabelStyle}>Sprint Name</p>
                <input
                  type="text"
                  placeholder="Enter sprint name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={itemFieldStyle}>
                <p style={itemLabelStyle}>Goal</p>
                <input
                  type="text"
                  placeholder="Enter sprint goal"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={itemFieldStyle}>
                <p style={itemLabelStyle}>Start Date</p>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={itemFieldStyle}>
                <p style={itemLabelStyle}>End Date</p>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={itemFieldStyle}>
                <p style={itemLabelStyle}>Status</p>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  style={inputStyle}
                >
                  {sprintStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={editActionRowStyle}>
              <button type="submit" style={primaryButtonStyle}>
                Save Sprint
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setName("");
                  setGoal("");
                  setStartDate("");
                  setEndDate("");
                  setStatus("Planned");
                  setError("");
                }}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      <section style={panelStyle}>
        <h2 style={panelTitleStyle}>Sprint Records</h2>
        <p style={panelSubtitleStyle}>
          Review sprint lifecycle, edit sprint details, and expand records for
          additional context.
        </p>

        {loading && <p style={{ color: "#334155" }}>Loading sprints...</p>}

        {error && (
          <p style={{ color: "#b91c1c", marginBottom: "1rem" }}>{error}</p>
        )}

        {!loading && sprints.length === 0 ? (
          <p style={{ color: "#334155" }}>No sprints found.</p>
        ) : (
          <div style={sprintListStyle}>
            {sprints.map((sprint) => {
              const isEditing = editingSprintId === sprint.sprintId;
              const isExpanded = expandedSprintId === sprint.sprintId;

              return (
                <div key={sprint.sprintId} style={sprintCardStyle}>
                  <div style={isEditing ? sprintRowEditModeStyle : sprintRowStyle}>
                    <div style={itemFieldStyle}>
                      <p style={itemLabelStyle}>Sprint</p>
                      <p style={itemValueStyle}>{sprint.name}</p>
                    </div>

                    <div style={itemFieldStyle}>
                      <p style={itemLabelStyle}>Status</p>
                      <p style={itemValueStyle}>{sprint.status}</p>
                    </div>

                    <div style={itemFieldStyle}>
                      <p style={itemLabelStyle}>Start</p>
                      <p style={itemValueStyle}>{formatDate(sprint.startDate)}</p>
                    </div>

                    <div style={itemFieldStyle}>
                      <p style={itemLabelStyle}>End</p>
                      <p style={itemValueStyle}>{formatDate(sprint.endDate)}</p>
                    </div>

                    <div style={actionsStyle}>
                      <button
                        type="button"
                        onClick={() => handleEditStart(sprint)}
                        style={secondaryButtonStyle}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(sprint.sprintId)}
                        onMouseEnter={() => setHoveredDeleteId(sprint.sprintId)}
                        onMouseLeave={() => setHoveredDeleteId(null)}
                        style={{
                          ...secondaryButtonStyle,
                          border:
                            hoveredDeleteId === sprint.sprintId
                              ? "1px solid #dc2626"
                              : "1px solid #cbd5e1",
                          backgroundColor:
                            hoveredDeleteId === sprint.sprintId
                              ? "#dc2626"
                              : "#ffffff",
                          color:
                            hoveredDeleteId === sprint.sprintId
                              ? "#ffffff"
                              : "#1f2937",
                        }}
                      >
                        Delete
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExpanded(sprint.sprintId)}
                        style={detailsButtonStyle}
                      >
                        {isExpanded ? "Hide Details" : "View Details"}
                      </button>
                    </div>
                  </div>

                  {isEditing && (
                    <div style={editExpandedStyle}>
                      <div style={editGridStyle}>
                        <div style={itemFieldStyle}>
                          <p style={itemLabelStyle}>Sprint Name</p>
                          <input
                            type="text"
                            placeholder="Enter sprint name"
                            value={editName}
                            onChange={(event) => setEditName(event.target.value)}
                            style={inputStyle}
                          />
                        </div>

                        <div style={itemFieldStyle}>
                          <p style={itemLabelStyle}>Goal</p>
                          <input
                            type="text"
                            placeholder="Enter sprint goal"
                            value={editGoal}
                            onChange={(event) => setEditGoal(event.target.value)}
                            style={inputStyle}
                          />
                        </div>

                        <div style={itemFieldStyle}>
                          <p style={itemLabelStyle}>Start Date</p>
                          <input
                            type="date"
                            value={editStartDate}
                            onChange={(event) => setEditStartDate(event.target.value)}
                            style={inputStyle}
                          />
                        </div>

                        <div style={itemFieldStyle}>
                          <p style={itemLabelStyle}>End Date</p>
                          <input
                            type="date"
                            value={editEndDate}
                            onChange={(event) => setEditEndDate(event.target.value)}
                            style={inputStyle}
                          />
                        </div>

                        <div style={itemFieldStyle}>
                          <p style={itemLabelStyle}>Status</p>
                          <select
                            value={editStatus}
                            onChange={(event) => setEditStatus(event.target.value)}
                            style={inputStyle}
                          >
                            {sprintStatusOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={editActionRowStyle}>
                        <button
                          type="button"
                          onClick={() => handleEditSave(sprint)}
                          style={primaryButtonStyle}
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={handleEditCancel}
                          style={secondaryButtonStyle}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {!isEditing && isExpanded && (
                    <div style={expandedSectionStyle}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                          gap: "1rem",
                        }}
                      >
                        <div style={itemFieldStyle}>
                          <p style={itemLabelStyle}>Goal</p>
                          <p style={detailTextStyle}>
                            {sprint.goal && sprint.goal.trim()
                              ? sprint.goal
                              : "No goal provided."}
                          </p>
                        </div>

                        <div style={itemFieldStyle}>
                          <p style={itemLabelStyle}>Start Date</p>
                          <p style={detailTextStyle}>{formatDate(sprint.startDate)}</p>
                        </div>

                        <div style={itemFieldStyle}>
                          <p style={itemLabelStyle}>End Date</p>
                          <p style={detailTextStyle}>{formatDate(sprint.endDate)}</p>
                        </div>

                        <div style={itemFieldStyle}>
                          <p style={itemLabelStyle}>Status</p>
                          <p style={detailTextStyle}>{sprint.status}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default SprintManagementPage;