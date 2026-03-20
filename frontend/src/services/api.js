const API_BASE_URL = "http://localhost:3001";

// =========================
// ITEM API FUNCTIONS
// =========================

// Fetch all work items from the backend
export async function getItems() {
  const response = await fetch(`${API_BASE_URL}/items`);

  if (!response.ok) {
    throw new Error("Failed to fetch items.");
  }

  return response.json();
}

// Create a new work item
export async function createItem(itemData) {
  const response = await fetch(`${API_BASE_URL}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itemData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create item.");
  }

  return response.json();
}

// Update an existing work item by id
export async function updateItem(itemId, itemData) {
  const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itemData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update item.");
  }

  return response.json();
}

// Delete a work item by id
export async function deleteItem(itemId) {
  const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete item.");
  }

  return response.json();
}

// =========================
// SPRINT API FUNCTIONS
// =========================

// Fetch all sprints from the backend
export async function getSprints() {
  const response = await fetch(`${API_BASE_URL}/sprints`);

  if (!response.ok) {
    throw new Error("Failed to fetch sprints.");
  }

  return response.json();
}

// Create a new sprint
export async function createSprint(sprintData) {
  const response = await fetch(`${API_BASE_URL}/sprints`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sprintData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create sprint.");
  }

  return response.json();
}

// Update an existing sprint by id
export async function updateSprint(sprintId, sprintData) {
  const response = await fetch(`${API_BASE_URL}/sprints/${sprintId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sprintData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update sprint.");
  }

  return response.json();
}

// Delete a sprint by id
export async function deleteSprint(sprintId) {
  const response = await fetch(`${API_BASE_URL}/sprints/${sprintId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete sprint.");
  }

  return response.json();
}

// Fetch the currently active sprint
export async function getActiveSprint() {
  const response = await fetch(`${API_BASE_URL}/sprints/active`);

  if (!response.ok) {
    throw new Error("Failed to fetch active sprint.");
  }

  return response.json();
}

// Fetch a single sprint by id
export async function getSprintById(sprintId) {
  const response = await fetch(`${API_BASE_URL}/sprints/${sprintId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch sprint.");
  }

  return response.json();
}

// Fetch the dashboard summary
export async function getDashboardSummary() {
  const response = await fetch(`${API_BASE_URL}/dashboard/summary`);

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard.");
  }

  return response.json();
}