// Low-level DynamoDB client
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

// Document client wrapper so we can work with normal JavaScript objects
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

// Create the DynamoDB client.
// Region comes from AWS_REGION if set, otherwise defaults to us-east-1.
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

// Wrap the low-level client with the document client.
// This makes reads/writes easier because it handles JS objects directly.
const dynamoDb = DynamoDBDocumentClient.from(client);

module.exports = { dynamoDb };