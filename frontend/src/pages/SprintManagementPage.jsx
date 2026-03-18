import { useEffect, useState } from "react";
import {
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint,
} from "../services/api";

function SprintManagementPage() {
  // Store all sprint records loaded from the backend
  const [sprints, setSprints] = useState([]);

  // Track page loading state
  const [loading, setLoading] = useState(true);

  // Store user-facing error messages
  const [error, setError] = useState("");

  // =========================
  // CREATE FORM STATE
  // =========================

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("Planned");

  // =========================
  // EDIT FORM STATE
  // =========================

  const [editingSprintId, setEditingSprintId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editGoal, setEditGoal] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editStatus, setEditStatus] = useState("Planned");

  // Allowed sprint status values should match backend validation
  const sprintStatusOptions = ["Planned", "Active", "Closed"];

  // Load all sprints from the backend
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

  // Run once when the page first loads
  useEffect(() => {
    loadSprints();
  }, []);

  // Handle creating a new sprint
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
        goal,
        startDate,
        endDate,
        status,
      });

      // Clear the form after successful create
      setName("");
      setGoal("");
      setStartDate("");
      setEndDate("");
      setStatus("Planned");

      // Reload sprint list so new sprint appears
      await loadSprints();
    } catch (err) {
      setError(err.message || "Failed to create sprint.");
    }
  }

  // Enter edit mode for one sprint
  function handleEditStart(sprint) {
    setEditingSprintId(sprint.sprintId);
    setEditName(sprint.name || "");
    setEditGoal(sprint.goal || "");
    setEditStartDate(sprint.startDate || "");
    setEditEndDate(sprint.endDate || "");
    setEditStatus(sprint.status || "Planned");
    setError("");
  }

  // Cancel edit mode
  function handleEditCancel() {
    setEditingSprintId(null);
    setEditName("");
    setEditGoal("");
    setEditStartDate("");
    setEditEndDate("");
    setEditStatus("Planned");
  }

  // Save sprint edits to the backend
  async function handleEditSave(sprint) {
    if (!editName.trim()) {
      setError("Sprint name is required.");
      return;
    }

    try {
      setError("");

      await updateSprint(sprint.sprintId, {
        name: editName.trim(),
        goal: editGoal,
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

  // Delete a sprint
  async function handleDelete(sprintId) {
    try {
      setError("");

      await deleteSprint(sprintId);
      await loadSprints();
    } catch (err) {
      setError(err.message || "Failed to delete sprint.");
    }
  }

  return (
    <div>
      <h1>Sprint Management</h1>

      {/* Form for creating a new sprint */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Sprint name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <input
          type="text"
          placeholder="Goal"
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <input
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <input
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          style={{ marginRight: "0.5rem" }}
        >
          {sprintStatusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button type="submit">Add Sprint</button>
      </form>

      {/* Loading and error messages */}
      {loading && <p>Loading sprints...</p>}
      {error && <p>{error}</p>}

      {/* Sprint list */}
      {!loading && sprints.length === 0 ? (
        <p>No sprints found.</p>
      ) : (
        <ul>
          {sprints.map((sprint) => (
            <li key={sprint.sprintId} style={{ marginBottom: "1rem" }}>
              {editingSprintId === sprint.sprintId ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    style={{ marginRight: "0.5rem" }}
                  />
                  <input
                    type="text"
                    value={editGoal}
                    onChange={(event) => setEditGoal(event.target.value)}
                    style={{ marginRight: "0.5rem" }}
                  />
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(event) => setEditStartDate(event.target.value)}
                    style={{ marginRight: "0.5rem" }}
                  />
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(event) => setEditEndDate(event.target.value)}
                    style={{ marginRight: "0.5rem" }}
                  />
                  <select
                    value={editStatus}
                    onChange={(event) => setEditStatus(event.target.value)}
                    style={{ marginRight: "0.5rem" }}
                  >
                    {sprintStatusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => handleEditSave(sprint)}>Save</button>
                  <button onClick={handleEditCancel} style={{ marginLeft: "0.5rem" }}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <strong>{sprint.name}</strong> - {sprint.status}
                  {sprint.goal ? ` - Goal: ${sprint.goal}` : ""}
                  {sprint.startDate ? ` - Start: ${sprint.startDate}` : ""}
                  {sprint.endDate ? ` - End: ${sprint.endDate}` : ""}
                  <button
                    onClick={() => handleEditStart(sprint)}
                    style={{ marginLeft: "0.75rem" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sprint.sprintId)}
                    style={{ marginLeft: "0.5rem" }}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SprintManagementPage;