import { useEffect, useState } from "react";
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  getSprints,
} from "../services/api";

function BacklogPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createStatus, setCreateStatus] = useState("Backlog");
  const [createPriority, setCreatePriority] = useState("Medium");
  const [createSprintId, setCreateSprintId] = useState("");

  const [sprints, setSprints] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [editingItemId, setEditingItemId] = useState(null);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [hoveredDeleteId, setHoveredDeleteId] = useState(null);

  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState("Backlog");
  const [editPriority, setEditPriority] = useState("Medium");
  const [editDescription, setEditDescription] = useState("");
  const [editSprintId, setEditSprintId] = useState("");

  const statusOptions = ["Backlog", "Ready", "In Progress", "Blocked", "Done"];
  const priorityOptions = ["Low", "Medium", "High", "Critical"];

  async function loadSprints() {
    try {
      const data = await getSprints();
      setSprints(data);
    } catch (err) {
      setError("Failed to load sprints.");
    }
  }

  async function loadItems() {
    try {
      setLoading(true);
      setError("");

      const data = await getItems();
      setItems(data);
    } catch (err) {
      setError("Failed to load backlog items.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
    loadSprints();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      setError("");

      await createItem({
        title: title.trim(),
        description: description.trim(),
        status: createStatus,
        priority: createPriority,
        sprintId: createSprintId || null,
      });

      setTitle("");
      setDescription("");
      setCreateStatus("Backlog");
      setCreatePriority("Medium");
      setCreateSprintId("");
      setShowCreateForm(false);
      await loadItems();
    } catch (err) {
      setError(err.message || "Failed to create item.");
    }
  }

  function handleEditStart(item) {
    setEditingItemId(item.itemId);
    setExpandedItemId(item.itemId);
    setEditTitle(item.title || "");
    setEditStatus(item.status || "Backlog");
    setEditPriority(item.priority || "Medium");
    setEditDescription(item.description || "");
    setEditSprintId(item.sprintId || "");
    setError("");
  }

  function handleEditCancel() {
    setEditingItemId(null);
    setExpandedItemId(null);
    setEditTitle("");
    setEditStatus("Backlog");
    setEditPriority("Medium");
    setEditDescription("");
    setEditSprintId("");
  }
  async function handleEditSave(item) {
    if (!editTitle.trim()) {
      setError("Edited title is required.");
      return;
    }

    try {
      setError("");

      await updateItem(item.itemId, {
        title: editTitle.trim(),
        status: editStatus,
        priority: editPriority,
        description: editDescription.trim(),
        storyPoints: item.storyPoints,
        assignee: item.assignee,
        labels: item.labels,
        sprintId: editSprintId || null,
        projectId: item.projectId,
      });

      setEditingItemId(null);
      setEditTitle("");
      setEditStatus("Backlog");
      setEditPriority("Medium");
      setEditDescription("");
      setEditSprintId("");

      await loadItems();
    } catch (err) {
      setError(err.message || "Failed to update item.");
    }
  }

  async function handleDelete(itemId) {
    try {
      setError("");
      await deleteItem(itemId);
      await loadItems();
    } catch (err) {
      setError(err.message || "Failed to delete item.");
    }
  }

  function toggleExpanded(itemId) {
    setExpandedItemId((current) => (current === itemId ? null : itemId));
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
    minHeight: "48px",
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

  const itemListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginTop: "1rem",
  };

  const itemCardStyle = {
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    overflow: "hidden",
  };

  const itemRowStyle = {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 2fr) repeat(2, minmax(120px, 0.8fr)) auto",
    gap: "1rem",
    alignItems: "center",
    padding: "1rem",
  };

  const itemRowEditModeStyle = {
    ...itemRowStyle,
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

  const detailTextStyle = {
    margin: 0,
    color: "#334155",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
  };

  const editGridStyle = {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
    gap: "0.75rem",
    marginBottom: "0.75rem",
  };

  const editActionRowStyle = {
    display: "flex",
    gap: "0.75rem",
    marginTop: "0.75rem",
  };

  return (
    <div style={pageStyle}>
      <h1 style={headerTitleStyle}>Backlog Management</h1>
      <p style={headerSubtitleStyle}>
        Track backlog items, update workflow state, and manage item details from
        a single view.
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
            <h2 style={panelTitleStyle}>Create Backlog Item</h2>
            <p style={panelSubtitleStyle}>
              Add a new work item to the backlog with an optional description.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateForm((current) => !current)}
            style={primaryButtonStyle}
          >
            {showCreateForm ? "Close" : "Add Item"}
          </button>
        </div>









        {showCreateForm && (
          <form onSubmit={handleSubmit} style={editExpandedStyle}>
            <div style={editGridStyle}>
              <div style={itemFieldStyle}>
                <p style={itemLabelStyle}>Title</p>
                <input
                  type="text"
                  placeholder="Enter work item title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={itemFieldStyle}>
                <p style={itemLabelStyle}>Status</p>
                <select
                  value={createStatus}
                  onChange={(event) => setCreateStatus(event.target.value)}
                  style={inputStyle}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div style={itemFieldStyle}>
                <p style={itemLabelStyle}>Priority</p>
                <select
                  value={createPriority}
                  onChange={(event) => setCreatePriority(event.target.value)}
                  style={inputStyle}
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              <div style={itemFieldStyle}>
                <p style={itemLabelStyle}>Sprint</p>
                <select
                  value={createSprintId}
                  onChange={(event) => setCreateSprintId(event.target.value)}
                  style={inputStyle}
                >
                  <option value="">No Sprint</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.sprintId} value={sprint.sprintId}>
                      {sprint.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ ...itemFieldStyle, marginTop: "0.75rem" }}>
              <p style={itemLabelStyle}>Description</p>
              <textarea
                placeholder="Add work item description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                style={textareaStyle}
              />
            </div>

            <div style={editActionRowStyle}>
              <button type="submit" style={primaryButtonStyle}>
                Save Item
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setTitle("");
                  setDescription("");
                  setCreateStatus("Backlog");
                  setCreatePriority("Medium");
                  setCreateSprintId("");
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
        <h2 style={panelTitleStyle}>Backlog Items</h2>
        <p style={panelSubtitleStyle}>
          Review, update, and expand individual backlog items.
        </p>

        {loading && <p style={{ color: "#334155" }}>Loading backlog items...</p>}

        {error && (
          <p style={{ color: "#b91c1c", marginBottom: "1rem" }}>{error}</p>
        )}

        {!loading && items.length === 0 ? (
          <p style={{ color: "#334155" }}>No backlog items found.</p>
        ) : (
          <div style={itemListStyle}>
            {items.map((item) => {
              const isEditing = editingItemId === item.itemId;
              const isExpanded = expandedItemId === item.itemId;

              return (
                <div key={item.itemId} style={itemCardStyle}>
                  <div style={isEditing ? itemRowEditModeStyle : itemRowStyle}>
                    <div style={itemFieldStyle}>
                      <p style={itemLabelStyle}>Title</p>
                      <p style={itemValueStyle}>{item.title}</p>
                    </div>

                    <div style={itemFieldStyle}>
                      <p style={itemLabelStyle}>Status</p>
                      <p style={itemValueStyle}>{item.status}</p>
                    </div>

                    <div style={itemFieldStyle}>
                      <p style={itemLabelStyle}>Priority</p>
                      <p style={itemValueStyle}>{item.priority}</p>
                    </div>

                    <div style={actionsStyle}>
                      <button
                        onClick={() => handleEditStart(item)}
                        style={secondaryButtonStyle}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(item.itemId)}
                        onMouseEnter={() => setHoveredDeleteId(item.itemId)}
                        onMouseLeave={() => setHoveredDeleteId(null)}
                        style={{
                          ...secondaryButtonStyle,
                          border:
                            hoveredDeleteId === item.itemId
                              ? "1px solid #dc2626"
                              : "1px solid #cbd5e1",
                          backgroundColor:
                            hoveredDeleteId === item.itemId
                              ? "#dc2626"
                              : "#ffffff",
                          color:
                            hoveredDeleteId === item.itemId
                              ? "#ffffff"
                              : "#1f2937",
                        }}
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => toggleExpanded(item.itemId)}
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
                          <p style={itemLabelStyle}>Title</p>
                          <input
                            type="text"
                            placeholder="Enter work item title"
                            value={editTitle}
                            onChange={(event) => setEditTitle(event.target.value)}
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
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={itemFieldStyle}>
                          <p style={itemLabelStyle}>Priority</p>
                          <select
                            value={editPriority}
                            onChange={(event) => setEditPriority(event.target.value)}
                            style={inputStyle}
                          >
                            {priorityOptions.map((priority) => (
                              <option key={priority} value={priority}>
                                {priority}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={itemFieldStyle}>
                          <p style={itemLabelStyle}>Sprint</p>
                          <select
                            value={editSprintId}
                            onChange={(event) => setEditSprintId(event.target.value)}
                            style={inputStyle}
                          >
                            <option value="">No Sprint</option>
                            {sprints.map((sprint) => (
                              <option key={sprint.sprintId} value={sprint.sprintId}>
                                {sprint.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ ...itemFieldStyle, marginTop: "0.75rem" }}>
                        <p style={itemLabelStyle}>Description</p>
                        <textarea
                          placeholder="Add work item description"
                          value={editDescription}
                          onChange={(event) => setEditDescription(event.target.value)}
                          style={textareaStyle}
                        />
                      </div>

                      <div style={editActionRowStyle}>
                        <button
                          type="button"
                          onClick={() => handleEditSave(item)}
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
                      <p style={{ ...itemLabelStyle, marginBottom: "0.5rem" }}>
                        Description
                      </p>
                      <p style={detailTextStyle}>
                        {item.description && item.description.trim()
                          ? item.description
                          : "No description provided."}
                      </p>
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

export default BacklogPage;