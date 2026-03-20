function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function successResponse(data) {
  return {
    success: true,
    data,
  };
}

function errorResponse(message) {
  return {
    success: false,
    error: message,
  };
}

module.exports = {
  buildResponse,
  successResponse,
  errorResponse,
};
