import { useEffect, useState } from "react";
import { getActiveSprint, getTasks, updateTask } from "../services/api";

function SprintBoardPage() {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activeSprint, setActiveSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const statuses = ["Backlog", "Ready", "In Progress", "Blocked", "Done"];
  const priorityOptions = ["Low", "Medium", "High", "Critical"];

  async function loadBoardData() {
    try {
      setLoading(true);
      setError("");

      const sprint = await getActiveSprint();
      const allTasks = await getTasks();

      const sprintTasks = allTasks.filter(
        (task) => task.sprintId === sprint.sprintId
      );

      setActiveSprint(sprint);
      setTasks(sprintTasks);
    } catch (err) {
      setError(err.message || "Failed to load sprint board.");
      setActiveSprint(null);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBoardData();
  }, []);

  async function handleStatusChange(task, newStatus) {
    try {
      setError("");

      await updateTask(task.taskId, {
        title: task.title,
        status: newStatus,
        priority: task.priority,
        description: task.description,
        storyPoints: task.storyPoints,
        assignee: task.assignee,
        labels: task.labels,
        sprintId: task.sprintId,
        projectId: task.projectId,
      });

      await loadBoardData();
    } catch (err) {
      setError(err.message || "Failed to update task status.");
    }
  }

  function getTasksByStatus(status) {
    return tasks.filter((task) => task.status === status);
  }

  function handleDragStart(taskId) {
    setDraggedTaskId(taskId);
  }

  function handleDragEnd() {
    setDraggedTaskId(null);
  }

async function handleDropStatus(newStatus) {
  if (!draggedTaskId) {
    return;
  }

  const task = tasks.find((entry) => entry.taskId === draggedTaskId);

  if (!task || task.status === newStatus) {
    setDraggedTaskId(null);
    return;
  }

  try {
    setError("");

    await updateTask(task.taskId, {
      title: task.title,
      status: newStatus,
      priority: task.priority,
      description: task.description,
      storyPoints: task.storyPoints,
      assignee: task.assignee,
      labels: task.labels,
      sprintId: task.sprintId,
      projectId: task.projectId,
    });

    setDraggedTaskId(null);
    await loadBoardData();
  } catch (err) {
    setError(err.message || "Failed to move task.");
    setDraggedTaskId(null);
  }
}

  const pageStyle = {
    padding: "1.5rem",
    maxWidth: "1400px",
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

  const sprintMetaGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  };

  const sprintMetaCardStyle = {
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    backgroundColor: "#f8fafc",
    padding: "1rem",
  };

  const metaLabelStyle = {
    margin: 0,
    fontSize: "0.8rem",
    color: "#64748b",
    fontWeight: "600",
    marginBottom: "0.35rem",
  };

  const metaValueStyle = {
    margin: 0,
    fontSize: "1rem",
    color: "#0f172a",
    fontWeight: "700",
  };

  const boardGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(220px, 1fr))",
    gap: "1rem",
    alignItems: "start",
  };

  const columnStyle = {
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    backgroundColor: "#e5e7eb",
    minHeight: "450px",
    overflow: "hidden",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
  };

  const columnHeaderStyle = {
    padding: "1rem",
    borderBottom: "1px solid #cbd5e1",
    backgroundColor: "#dbe1e8",
  };

  const columnTitleStyle = {
    margin: 0,
    color: "#1f2937",
    fontSize: "1rem",
    fontWeight: "700",
  };

  const columnCountStyle = {
    margin: "0.35rem 0 0 0",
    color: "#64748b",
    fontSize: "0.85rem",
    fontWeight: "600",
  };

  const columnBodyStyle = {
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
  };

  const cardStyle = {
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    padding: "0.95rem",
    cursor: "grab",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
  };

  const draggingCardStyle = {
    ...cardStyle,
    opacity: 0.55,
    cursor: "grabbing",
  };

  const cardTitleStyle = {
    marginTop: 0,
    marginBottom: "0.85rem",
    color: "#0f172a",
    fontSize: "1rem",
    fontWeight: "700",
    lineHeight: 1.4,
  };

  const cardFieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
  };

  const cardLabelStyle = {
    margin: 0,
    fontSize: "0.78rem",
    color: "#64748b",
    fontWeight: "600",
  };

  const cardValueStyle = {
    margin: 0,
    fontSize: "0.95rem",
    color: "#1f2937",
    fontWeight: "600",
  };

  const emptyStateStyle = {
    border: "1px dashed #94a3b8",
    borderRadius: "10px",
    backgroundColor: "#f8fafc",
    padding: "1rem",
    color: "#64748b",
    textAlign: "center",
    fontWeight: "600",
  };

  const columnDropZoneStyle = {
    ...columnStyle,
    transition: "background-color 0.15s ease, border-color 0.15s ease",
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1 style={headerTitleStyle}>Sprint Board</h1>
        <p style={headerSubtitleStyle}>
          Review sprint progress and move work across delivery states.
        </p>
        <section style={panelStyle}>
          <p style={{ color: "#334155", margin: 0 }}>Loading sprint board...</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <h1 style={headerTitleStyle}>Sprint Board</h1>
        <p style={headerSubtitleStyle}>
          Review sprint progress and move work across delivery states.
        </p>
        <section style={panelStyle}>
          <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p>
        </section>
      </div>
    );
  }

  if (!activeSprint) {
    return (
      <div style={pageStyle}>
        <h1 style={headerTitleStyle}>Sprint Board</h1>
        <p style={headerSubtitleStyle}>
          Review sprint progress and move work across delivery states.
        </p>
        <section style={panelStyle}>
          <p style={{ color: "#334155", margin: 0 }}>No active sprint found.</p>
        </section>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={headerTitleStyle}>Sprint Board</h1>
      <p style={headerSubtitleStyle}>
        Review sprint progress and move work across delivery states.
      </p>

      <section style={panelStyle}>
        <h2 style={panelTitleStyle}>Active Sprint</h2>
        <p style={panelSubtitleStyle}>
          Current sprint context and delivery focus.
        </p>

        <div style={sprintMetaGridStyle}>
          <div style={sprintMetaCardStyle}>
            <p style={metaLabelStyle}>Sprint Name</p>
            <p style={metaValueStyle}>{activeSprint.name}</p>
          </div>

          <div style={sprintMetaCardStyle}>
            <p style={metaLabelStyle}>Goal</p>
            <p style={metaValueStyle}>
              {activeSprint.goal && activeSprint.goal.trim()
                ? activeSprint.goal
                : "No goal provided"}
            </p>
          </div>

          <div style={sprintMetaCardStyle}>
            <p style={metaLabelStyle}>Assigned Tasks</p>
            <p style={metaValueStyle}>{tasks.length}</p>
          </div>
        </div>
      </section>

      <section style={boardGridStyle}>
        {statuses.map((status) => {
          const columnTasks = getTasksByStatus(status);

          return (
            <div
              key={status}
              style={columnDropZoneStyle}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDropStatus(status)}
            >
              <div style={columnHeaderStyle}>
                <h3 style={columnTitleStyle}>{status}</h3>
                <p style={columnCountStyle}>
                  {columnTasks.length} {columnTasks.length === 1 ? "task" : "tasks"}
                </p>
              </div>

              <div style={columnBodyStyle}>
                {columnTasks.length === 0 ? (
                  <div style={emptyStateStyle}>No tasks</div>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task.taskId}
                      draggable
                      onDragStart={() => handleDragStart(task.taskId)}
                      onDragEnd={handleDragEnd}
                      style={
                        draggedTaskId === task.taskId ? draggingCardStyle : cardStyle
                      }
                    >
                      <h4 style={cardTitleStyle}>{task.title}</h4>

                      <div style={cardFieldStyle}>
                        <p style={cardLabelStyle}>Priority</p>
                        <p style={cardValueStyle}>{task.priority || "None"}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );


        })}
      </section>
    </div>
  );
}

export default SprintBoardPage;