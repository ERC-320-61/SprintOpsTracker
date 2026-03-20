const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDb } = require("../utils/dynamoClient");

const WORK_ITEMS_TABLE = "WorkItems";
const SPRINTS_TABLE = "Sprints";

async function getDashboardSummary() {
  // Read all work items and sprints in parallel for the dashboard summary.
  const [itemsResult, sprintsResult] = await Promise.all([
    dynamoDb.send(
      new ScanCommand({
        TableName: WORK_ITEMS_TABLE,
      })
    ),
    dynamoDb.send(
      new ScanCommand({
        TableName: SPRINTS_TABLE,
      })
    ),
  ]);

  const items = itemsResult.Items || [];
  const sprints = sprintsResult.Items || [];

  // Find the currently active sprint, if one exists.
  const activeSprint = sprints.find((sprint) => sprint.status === "Active") || null;

  // Build high-level counts by item workflow status.
  const projectSummary = {
    totalItems: items.length,
    backlogItems: items.filter((item) => item.status === "Backlog").length,
    readyItems: items.filter((item) => item.status === "Ready").length,
    inProgressItems: items.filter((item) => item.status === "In Progress").length,
    blockedItems: items.filter((item) => item.status === "Blocked").length,
    doneItems: items.filter((item) => item.status === "Done").length,
  };

  // Build counts by item priority.
  const prioritySummary = {
    low: items.filter((item) => item.priority === "Low").length,
    medium: items.filter((item) => item.priority === "Medium").length,
    high: items.filter((item) => item.priority === "High").length,
    critical: items.filter((item) => item.priority === "Critical").length,
  };

  let activeSprintSummary = null;

  if (activeSprint) {
    // Count how many items are assigned to the active sprint.
    const activeSprintItems = items.filter(
      (item) => item.sprintId === activeSprint.sprintId
    );

    activeSprintSummary = {
      sprintId: activeSprint.sprintId,
      name: activeSprint.name,
      status: activeSprint.status,
      itemCount: activeSprintItems.length,
    };
  }

  return {
    projectSummary,
    prioritySummary,
    activeSprint: activeSprintSummary,
  };
}

module.exports = {
  getDashboardSummary,
};