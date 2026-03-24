const { randomUUID } = require("crypto");
const {
  ScanCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { dynamoDb } = require("../utils/dynamoClient");

// Table name is configurable, but defaults to WorkItems
const TABLE_NAME = process.env.WORK_ITEMS_TABLE_NAME || "WorkItems";

// Get all items from the table
async function getAllItems() {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
  });

  const result = await dynamoDb.send(command);

  // Return an empty array if no items exist yet
  return result.Items || [];
}

// Get one item by itemId
async function getItemById(itemId) {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { itemId },
  });

  const result = await dynamoDb.send(command);

  return result.Item || null;
}

// Create a new item and save it to DynamoDB
async function createItem(data) {
  const now = new Date().toISOString();

  const newItem = {
    itemId: randomUUID(),
    projectId: data.projectId || "proj-001",
    sprintId: data.sprintId || null,
    title: data.title,
    description: data.description || "",
    status: data.status || "Backlog",
    priority: data.priority || "Medium",
    storyPoints: data.storyPoints || 0,
    assignee: data.assignee || "",
    labels: data.labels || [],
    createdAt: now,
    updatedAt: now,
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: newItem,
  });

  await dynamoDb.send(command);

  return newItem;
}

// Update an existing item.
// For simplicity, we read the item first, merge updates, then write the full item back.
async function updateItem(itemId, updates) {
  const existingItem = await getItemById(itemId);

  if (!existingItem) {
    return null;
  }

  const updatedItem = {
    ...existingItem,
    ...updates,
    itemId: existingItem.itemId,      // never allow itemId to change
    createdAt: existingItem.createdAt, // preserve original creation time
    updatedAt: new Date().toISOString(),
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: updatedItem,
  });

  await dynamoDb.send(command);

  return updatedItem;
}

// Delete an item by itemId
async function deleteItem(itemId) {
  const existingItem = await getItemById(itemId);

  if (!existingItem) {
    return false;
  }

  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { itemId },
  });

  await dynamoDb.send(command);

  return true;
}

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};