const { buildResponse } = require("../utils/response");

async function itemsHandler(event) {
  return buildResponse(200, {
    message: "Items handler is working",
    method: event?.httpMethod || "N/A",
    items: [
      {
        itemId: "item-001",
        title: "Sample backlog item",
        status: "Backlog",
        priority: "High",
      },
    ],
  });
}

module.exports = { itemsHandler };