const { itemsHandler } = require("./src/handlers/itemsHandler");

exports.handler = async (event) => {
  return await itemsHandler(event);
};