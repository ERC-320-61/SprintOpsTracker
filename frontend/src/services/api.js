const API_BASE_URL = "http://localhost:3001";

// Fetch all work items from the backend API
export async function getItems() {
  const response = await fetch(`${API_BASE_URL}/items`);

  if (!response.ok) {
    throw new Error("Failed to fetch items.");
  }

  return response.json();
}

// Send a new work item to the backend API
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