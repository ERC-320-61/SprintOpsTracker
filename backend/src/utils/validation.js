const ALLOWED_ITEM_STATUSES = ["Backlog", "Ready", "In Progress", "Blocked", "Done"];
const ALLOWED_PRIORITIES = ["Low", "Medium", "High", "Critical"];
const ALLOWED_SPRINT_STATUSES = ["Planned", "Active", "Closed"];

function validateRequiredFields(data, requiredFields) {
  const missingFields = requiredFields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === "";
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

function validateItemFields(data) {
  if (data.status && !ALLOWED_ITEM_STATUSES.includes(data.status)) {
    return { isValid: false, message: "Invalid status value." };
  }

  if (data.priority && !ALLOWED_PRIORITIES.includes(data.priority)) {
    return { isValid: false, message: "Invalid priority value." };
  }

  return { isValid: true };
}

function validateSprintFields(data) {
  if (data.status && !ALLOWED_SPRINT_STATUSES.includes(data.status)) {
    return { isValid: false, message: "Invalid sprint status value." };
  }

  return { isValid: true };
}

module.exports = {
  validateRequiredFields,
  validateItemFields,
  validateSprintFields,
  ALLOWED_ITEM_STATUSES,
  ALLOWED_PRIORITIES,
  ALLOWED_SPRINT_STATUSES,
};