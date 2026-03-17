const ALLOWED_STATUSES = ["Backlog", "Ready", "In Progress", "Blocked", "Done"];
const ALLOWED_PRIORITIES = ["Low", "Medium", "High", "Critical"];

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
  if (data.status && !ALLOWED_STATUSES.includes(data.status)) {
    return { isValid: false, message: "Invalid status value." };
  }

  if (data.priority && !ALLOWED_PRIORITIES.includes(data.priority)) {
    return { isValid: false, message: "Invalid priority value." };
  }

  return { isValid: true };
}

module.exports = {
  validateRequiredFields,
  validateItemFields,
  ALLOWED_STATUSES,
  ALLOWED_PRIORITIES,
};