const { buildResponse } = require("../utils/response");
const {
  validateRequiredFields,
  validateItemFields,
} = require("../utils/validation");
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require("../services/itemsService");

async function itemsHandler(event) {
  try {
    const method = event.httpMethod;
    const itemId = event.pathParameters?.id;

    // GET /items/:id
    if (method === "GET" && itemId) {
      const item = await getItemById(itemId);

      if (!item) {
        return buildResponse(404, { message: "Item not found." });
      }

      return buildResponse(200, item);
    }

    // GET /items
    if (method === "GET") {
      const items = await getAllItems();
      return buildResponse(200, items);
    }

    // POST /items
    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");

      const requiredCheck = validateRequiredFields(body, ["title"]);
      if (!requiredCheck.isValid) {
        return buildResponse(400, {
          message: "Missing required fields.",
          missingFields: requiredCheck.missingFields,
        });
      }

      const fieldCheck = validateItemFields(body);
      if (!fieldCheck.isValid) {
        return buildResponse(400, { message: fieldCheck.message });
      }

      const newItem = await createItem(body);
      return buildResponse(201, newItem);
    }

    // PUT /items/:id
    if (method === "PUT" && itemId) {
      const body = JSON.parse(event.body || "{}");

      const fieldCheck = validateItemFields(body);
      if (!fieldCheck.isValid) {
        return buildResponse(400, { message: fieldCheck.message });
      }

      const updated = await updateItem(itemId, body);

      if (!updated) {
        return buildResponse(404, { message: "Item not found." });
      }

      return buildResponse(200, updated);
    }

    // DELETE /items/:id
    if (method === "DELETE" && itemId) {
      const deleted = await deleteItem(itemId);

      if (!deleted) {
        return buildResponse(404, { message: "Item not found." });
      }

      return buildResponse(200, { message: "Item deleted successfully." });
    }

    // Any unsupported method falls through to here
    return buildResponse(405, { message: "Method not allowed." });
  } catch (error) {
    console.error("itemsHandler error:", error);

    return buildResponse(500, {
      message: "Internal server error.",
      error: error.message,
    });
  }
}

module.exports = { itemsHandler };