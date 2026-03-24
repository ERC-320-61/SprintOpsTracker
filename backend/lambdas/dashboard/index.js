const {
  getDashboardSummaryHandler,
} = require("./src/handlers/dashboardHandler");

exports.handler = async (event) => {
  return await getDashboardSummaryHandler(event);
};