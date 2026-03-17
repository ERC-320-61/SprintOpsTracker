const express = require("express");
const cors = require("cors");
const { itemsHandler } = require("./src/handlers/itemsHandler");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`SprintOpsTracker backend running on http://localhost:${PORT}`);
});