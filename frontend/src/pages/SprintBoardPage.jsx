import { useEffect, useState } from "react";
import { getActiveSprint, getItems, updateItem } from "../services/api";

function SprintBoardPage() {
  // Active sprint metadata
  const [activeSprint, setActiveSprint] = useState(null);

  // Work items assigned to the active sprint
  const [items, setItems] = useState([]);

  // Loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // These are the board columns
  const statuses = ["Backlog", "Ready", "In Progress", "Blocked", "Done"];

  // Load active sprint and all items, then filter items to that sprint
  async function loadBoardData() {
    try {
      setLoading(true);
      setError("");

      const sprint = await getActiveSprint();
      const allItems = await getItems();

      const sprintItems = allItems.filter(
        (item) => item.sprintId === sprint.sprintId
      );

      setActiveSprint(sprint);
      setItems(sprintItems);
    } catch (err) {
      setError(err.message || "Failed to load sprint board.");
      setActiveSprint(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBoardData();
  }, []);

  // Update one item’s status from the board
  async function handleStatusChange(item, newStatus) {
    try {
      setError("");

      await updateItem(item.itemId, {
        title: item.title,
        status: newStatus,
        priority: item.priority,
        description: item.description,
        storyPoints: item.storyPoints,
        assignee: item.assignee,
        labels: item.labels,
        sprintId: item.sprintId,
        projectId: item.projectId,
      });

      await loadBoardData();
    } catch (err) {
      setError(err.message || "Failed to update item status.");
    }
  }

  // Group items into columns by status
  function getItemsByStatus(status) {
    return items.filter((item) => item.status === status);
  }

  if (loading) {
    return <p>Loading sprint board...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!activeSprint) {
    return <p>No active sprint found.</p>;
  }

  return (
    <div>
      <h1>Sprint Board</h1>

      <p>
        <strong>{activeSprint.name}</strong>
        {activeSprint.goal ? ` - Goal: ${activeSprint.goal}` : ""}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "1rem",
          alignItems: "start",
        }}
      >
        {statuses.map((status) => (
          <div
            key={status}
            style={{
              border: "1px solid #ccc",
              padding: "0.75rem",
              minHeight: "250px",
            }}
          >
            <h3>{status}</h3>

            {getItemsByStatus(status).length === 0 ? (
              <p>No items</p>
            ) : (
              getItemsByStatus(status).map((item) => (
                <div
                  key={item.itemId}
                  style={{
                    border: "1px solid #aaa",
                    padding: "0.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <strong>{item.title}</strong>
                  <p style={{ margin: "0.5rem 0" }}>
                    Priority: {item.priority}
                  </p>

                  <select
                    value={item.status}
                    onChange={(event) =>
                      handleStatusChange(item, event.target.value)
                    }
                  >
                    {statuses.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SprintBoardPage;