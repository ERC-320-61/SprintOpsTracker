const { buildResponse } = require("../utils/response");
const {
  validateRequiredFields,
  validateSprintFields,
} = require("../utils/validation");
const {
  getAllSprints,
  getSprintById,
  createSprint,
  updateSprint,
  deleteSprint,
  getActiveSprint,
} = require("../services/sprintsService");

async function sprintsHandler(event) {
  try {
    const method = event.httpMethod || event.requestContext?.http?.method;
    const sprintId = event.pathParameters?.id;

        // GET /sprints/active
    if (method === "GET" && sprintId === "active") {
      const sprint = await getActiveSprint();

      if (!sprint) {
        return buildResponse(404, { message: "No active sprint found." });
      }

      return buildResponse(200, sprint);
    }

    // GET /sprints/:id
    if (method === "GET" && sprintId) {
      const sprint = await getSprintById(sprintId);

      if (!sprint) {
        return buildResponse(404, { message: "Sprint not found." });
      }

      return buildResponse(200, sprint);
    }

    // GET /sprints
    if (method === "GET") {
      const sprints = await getAllSprints();
      return buildResponse(200, sprints);
    }

    // POST /sprints
    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");

      const requiredCheck = validateRequiredFields(body, ["name"]);
      if (!requiredCheck.isValid) {
        return buildResponse(400, {
          message: "Missing required fields.",
          missingFields: requiredCheck.missingFields,
        });
      }

      const fieldCheck = validateSprintFields(body);
      if (!fieldCheck.isValid) {
        return buildResponse(400, { message: fieldCheck.message });
      }

      const newSprint = await createSprint(body);
      return buildResponse(201, newSprint);
    }

    // PUT /sprints/:id
    if (method === "PUT" && sprintId) {
      const body = JSON.parse(event.body || "{}");

      const fieldCheck = validateSprintFields(body);
      if (!fieldCheck.isValid) {
        return buildResponse(400, { message: fieldCheck.message });
      }

      const updated = await updateSprint(sprintId, body);

      if (!updated) {
        return buildResponse(404, { message: "Sprint not found." });
      }

      return buildResponse(200, updated);
    }

    // DELETE /sprints/:id
    if (method === "DELETE" && sprintId) {
      const deleted = await deleteSprint(sprintId);

      if (!deleted) {
        return buildResponse(404, { message: "Sprint not found." });
      }

      return buildResponse(200, { message: "Sprint deleted successfully." });
    }

    return buildResponse(405, { message: "Method not allowed." });
  } catch (error) {
    console.error("sprintsHandler error:", error);

    return buildResponse(500, {
      message: "Internal server error.",
      error: error.message,
    });
  }
}

module.exports = { sprintsHandler };