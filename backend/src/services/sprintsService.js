const { randomUUID } = require("crypto");
const {
  ScanCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { dynamoDb } = require("../utils/dynamoClient");

// Table name is configurable, but defaults to Sprints
const TABLE_NAME = process.env.SPRINTS_TABLE || "Sprints";

// Get all sprints from DynamoDB
async function getAllSprints() {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
  });

  const result = await dynamoDb.send(command);
  return result.Items || [];
}

// Get one sprint by sprintId
async function getSprintById(sprintId) {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { sprintId },
  });

  const result = await dynamoDb.send(command);
  return result.Item || null;
}

// Create a new sprint
async function createSprint(data) {
  const now = new Date().toISOString();

  const newSprint = {
    sprintId: randomUUID(),
    projectId: data.projectId || "proj-001",
    name: data.name,
    goal: data.goal || "",
    startDate: data.startDate || "",
    endDate: data.endDate || "",
    status: data.status || "Planned",
    createdAt: now,
    updatedAt: now,
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: newSprint,
  });

  await dynamoDb.send(command);
  return newSprint;
}

// Update an existing sprint
async function updateSprint(sprintId, updates) {
  const existingSprint = await getSprintById(sprintId);

  if (!existingSprint) {
    return null;
  }

  const updatedSprint = {
    ...existingSprint,
    ...updates,
    sprintId: existingSprint.sprintId,
    createdAt: existingSprint.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: updatedSprint,
  });

  await dynamoDb.send(command);
  return updatedSprint;
}

// Delete a sprint
async function deleteSprint(sprintId) {
  const existingSprint = await getSprintById(sprintId);

  if (!existingSprint) {
    return false;
  }

  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { sprintId },
  });

  await dynamoDb.send(command);
  return true;
}

// Get the currently active sprint.
// For now, assume there is at most one active sprint at a time.
async function getActiveSprint() {
  const allSprints = await getAllSprints();

  return allSprints.find((sprint) => sprint.status === "Active") || null;
}

module.exports = {
  getAllSprints,
  getSprintById,
  createSprint,
  updateSprint,
  deleteSprint,
  getActiveSprint,
}; 