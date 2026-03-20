const { getDashboardSummary } = require("../services/dashboardService");
const { successResponse, errorResponse } = require("../utils/response");

// Handles the dashboard summary request and returns aggregated dashboard data.
async function getDashboardSummaryHandler(req, res) {
  try {
    const summary = await getDashboardSummary();
    return res.status(200).json(successResponse(summary));
  } catch (error) {
    console.error("Error getting dashboard summary:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
      errorType: typeof errorResponse,
    });
  }
}

module.exports = {
  getDashboardSummaryHandler,
};