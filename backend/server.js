const express = require("express");
const cors = require("cors");
const { itemsHandler } = require("./src/handlers/itemsHandler");
const { sprintsHandler } = require("./src/handlers/sprintsHandler");
const { getDashboardSummaryHandler } = require("./src/handlers/dashboardHandler");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Item routes
app.get("/items", async (req, res) => {
  const result = await itemsHandler({
    httpMethod: "GET",
    pathParameters: {},
    body: null,
  });

  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.get("/items/:id", async (req, res) => {
  const result = await itemsHandler({
    httpMethod: "GET",
    pathParameters: { id: req.params.id },
    body: null,
  });

  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.post("/items", async (req, res) => {
  const result = await itemsHandler({
    httpMethod: "POST",
    pathParameters: {},
    body: JSON.stringify(req.body),
  });

  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.put("/items/:id", async (req, res) => {
  const result = await itemsHandler({
    httpMethod: "PUT",
    pathParameters: { id: req.params.id },
    body: JSON.stringify(req.body),
  });

  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.delete("/items/:id", async (req, res) => {
  const result = await itemsHandler({
    httpMethod: "DELETE",
    pathParameters: { id: req.params.id },
    body: null,
  });

  res.status(result.statusCode).json(JSON.parse(result.body));
});

// Sprint routes
app.get("/sprints", async (req, res) => {
  const result = await sprintsHandler({
    httpMethod: "GET",
    pathParameters: {},
    body: null,
  });

  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.get("/sprints/:id", async (req, res) => {
  const result = await sprintsHandler({
    httpMethod: "GET",
    pathParameters: { id: req.params.id },
    body: null,
  });

  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.post("/sprints", async (req, res) => {
  const result = await sprintsHandler({
    httpMethod: "POST",
    pathParameters: {},
    body: JSON.stringify(req.body),
  });

  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.put("/sprints/:id", async (req, res) => {
  const result = await sprintsHandler({
    httpMethod: "PUT",
    pathParameters: { id: req.params.id },
    body: JSON.stringify(req.body),
  });

  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.delete("/sprints/:id", async (req, res) => {
  const result = await sprintsHandler({
    httpMethod: "DELETE",
    pathParameters: { id: req.params.id },
    body: null,
  });

  res.status(result.statusCode).json(JSON.parse(result.body));
});

// Dashboard route
// Old Express route
// app.get("/dashboard/summary", getDashboardSummaryHandler);

// Dashboard route
app.get("/dashboard/summary", async (req, res) => {
  const result = await getDashboardSummaryHandler({
    httpMethod: "GET",
    pathParameters: {},
    body: null,
  });

  res.status(result.statusCode).json(JSON.parse(result.body));
}); 

app.listen(PORT, () => {
  console.log(`SprintOpsTracker backend running on http://localhost:${PORT}`);
});