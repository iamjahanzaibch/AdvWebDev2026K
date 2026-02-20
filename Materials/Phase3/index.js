require("dotenv").config();

const express = require("express");
const app = express();
const PORT = Number(process.env.PORT) || 5000;
const path = require("path");

// Timestamp
function timestamp() {
  const now = new Date();
  return now.toISOString().replace("T", " ").replace("Z", "");
}

// --- Middleware ---
app.use(express.json()); // Parse application/json

// Serve everything in ./public as static assets
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// --- Views (HTML pages) ---
// GET /  -> serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Optional: GET /resources -> serve resources.html directly
app.get("/resources", (req, res) => {
  res.sendFile(path.join(publicDir, "resources.html"));
});

// POST /api/resources -> create/update/delete based on "action"
app.post("/api/resources", (req, res) => {
  const {
    action = "",
    resourceName = "",
    resourceDescription = "",
    resourceAvailable = false,
    resourcePrice = 0,
    resourcePriceUnit = "",
  } = req.body || {};

  // Normalize inputs
  const resourceAction = String(action).trim();
  const name = String(resourceName).trim();
  const description = String(resourceDescription).trim();
  const available =
    resourceAvailable === true ||
    resourceAvailable === "true" ||
    resourceAvailable === 1 ||
    resourceAvailable === "1";
  const price = Number.isFinite(Number(resourcePrice))
    ? Number(resourcePrice)
    : 0;
  const unit = String(resourcePriceUnit || "").trim();

  if (!["create", "update", "delete"].includes(resourceAction)) {
    return res.status(400).json({
      ok: false,
      error: "Invalid action. Use create, update, or delete.",
    });
  }

  if (!name) {
    return res.status(400).json({
      ok: false,
      error: "resourceName is required.",
    });
  }

  if ((resourceAction === "create" || resourceAction === "update") && !description) {
    return res.status(400).json({
      ok: false,
      error: "resourceDescription is required for create/update.",
    });
  }

  if ((resourceAction === "create" || resourceAction === "update") && !unit) {
    return res.status(400).json({
      ok: false,
      error: "resourcePriceUnit is required for create/update.",
    });
  }

  // The client's request to the console
  console.log("The client's POST request ", `[${timestamp()}]`);
  console.log("--------------------------");
  console.log("Action ➡️ ", resourceAction);
  console.log("Name ➡️ ", name);
  console.log("Description ➡️ ", description);
  console.log("Availability ➡️ ", available);
  console.log("Price ➡️ ", price);
  console.log("Price unit ➡️ ", unit);
  console.log("--------------------------");
  return res.json({
    ok: true,
    echo: {
      action: resourceAction,
      resourceName: name,
      resourceDescription: description,
      resourceAvailable: available,
      resourcePrice: price,
      resourcePriceUnit: unit,
    },
  });
});

// --- Fallback 404 for unknown API routes ---
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
