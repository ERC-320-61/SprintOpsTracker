import { useEffect, useState } from "react";
import { getItems, createItem, updateItem, deleteItem } from "../services/api";

function BacklogPage() {
  // Store the list of work items shown on the page
  const [items, setItems] = useState([]);

  // Track whether the page is currently waiting for data
  const [loading, setLoading] = useState(true);

  // Store a user-facing error message if something fails
  const [error, setError] = useState("");

  // Store the current text typed into the new-item input
  const [title, setTitle] = useState("");

  // Track which item is currently being edited
  const [editingItemId, setEditingItemId] = useState(null);

  // Store the editable field values while updating an item
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState("Backlog");
  const [editPriority, setEditPriority] = useState("Medium");

  // Allowed values should match backend validation rules
  const statusOptions = ["Backlog", "Ready", "In Progress", "Blocked", "Done"];
  const priorityOptions = ["Low", "Medium", "High", "Critical"];

  // Load all items from the backend and update page state
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

  // Run once when the page first loads
  useEffect(() => {
    loadItems();
  }, []);

  // Handle form submission for creating a new work item
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
        status: "Backlog",
        priority: "Medium",
      });

      setTitle("");
      await loadItems();
    } catch (err) {
      setError(err.message || "Failed to create item.");
    }
  }

  // Start editing a specific item and preload current values into form state
  function handleEditStart(item) {
    setEditingItemId(item.itemId);
    setEditTitle(item.title);
    setEditStatus(item.status || "Backlog");
    setEditPriority(item.priority || "Medium");
    setError("");
  }

  // Cancel editing mode and clear edit state
  function handleEditCancel() {
    setEditingItemId(null);
    setEditTitle("");
    setEditStatus("Backlog");
    setEditPriority("Medium");
  }

  // Save the updated item fields to the backend
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
        description: item.description,
        storyPoints: item.storyPoints,
        assignee: item.assignee,
        labels: item.labels,
        sprintId: item.sprintId,
        projectId: item.projectId,
      });

      setEditingItemId(null);
      setEditTitle("");
      setEditStatus("Backlog");
      setEditPriority("Medium");

      await loadItems();
    } catch (err) {
      setError(err.message || "Failed to update item.");
    }
  }

  // Delete an item and reload the list
  async function handleDelete(itemId) {
    try {
      setError("");

      await deleteItem(itemId);
      await loadItems();
    } catch (err) {
      setError(err.message || "Failed to delete item.");
    }
  }

  return (
    <div>
      <h1>Backlog</h1>

      {/* Simple form for creating a new work item */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Enter work item title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <button type="submit">Add Item</button>
      </form>

      {/* Show loading message while waiting for backend data */}
      {loading && <p>Loading backlog items...</p>}

      {/* Show error message if API call fails */}
      {error && <p>{error}</p>}

      {!loading && items.length === 0 ? (
        <p>No backlog items found.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.itemId} style={{ marginBottom: "0.75rem" }}>
              {editingItemId === item.itemId ? (
                <>
                  {/* Editable title */}
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    style={{ marginRight: "0.5rem" }}
                  />

                  {/* Editable status */}
                  <select
                    value={editStatus}
                    onChange={(event) => setEditStatus(event.target.value)}
                    style={{ marginRight: "0.5rem" }}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  {/* Editable priority */}
                  <select
                    value={editPriority}
                    onChange={(event) => setEditPriority(event.target.value)}
                    style={{ marginRight: "0.5rem" }}
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>

                  <button onClick={() => handleEditSave(item)}>Save</button>
                  <button
                    onClick={handleEditCancel}
                    style={{ marginLeft: "0.5rem" }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <strong>{item.title}</strong> - {item.status} - {item.priority}
                  <button
                    onClick={() => handleEditStart(item)}
                    style={{ marginLeft: "0.75rem" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.itemId)}
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

export default BacklogPage;