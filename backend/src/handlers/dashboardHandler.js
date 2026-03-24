const { getDashboardSummary } = require("../services/dashboardService");
const { buildResponse } = require("../utils/response");



// Lambda style
// Handles the dashboard summary request and returns aggregated dashboard data.
async function getDashboardSummaryHandler(event) {
  try {
    const summary = await getDashboardSummary();
    return buildResponse(200, summary);
  } catch (error) {
    console.error("dashboardHandler error:", error);

    return buildResponse(500, {
      message: "Failed to get dashboard summary.",
      error: error.message,
    });
  }
}

module.exports = {
  getDashboardSummaryHandler
};