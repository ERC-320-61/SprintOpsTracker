const { buildResponse } = require("../utils/response");

async function projectsHandler(event) {
  return buildResponse(200, {
    message: "Projects handler is working",
    method: event?.httpMethod || "N/A",
    projects: [
      {
        projectId: "proj-001",
        name: "Sprint-OpsTracker Default Project",
      },
    ],
  });
}

module.exports = { projectsHandler };