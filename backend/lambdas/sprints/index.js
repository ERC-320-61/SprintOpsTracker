const { sprintsHandler } = require("./src/handlers/sprintsHandler");

exports.handler = async (event) => {
  return await sprintsHandler(event);
};