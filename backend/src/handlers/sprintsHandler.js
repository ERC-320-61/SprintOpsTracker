const { buildResponse } = require("../utils/response");

async function sprintsHandler(event) {
  return buildResponse(200, {
    message: "Sprints handler is working",
    method: event?.httpMethod || "N/A",
    sprints: [
      {
        sprintId: "sprint-001",
        name: "Sprint 1",
        status: "planned",
      },
    ],
  });
}

module.exports = { sprintsHandler };