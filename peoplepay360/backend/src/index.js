const express = require("express");
const cors = require("cors");
require("dotenv").config();

const routes = require("./routes");
const authRoutes = require("./routes/auth");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

// Only bind a port when started directly, so tests can require the app.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`peoplepay360 API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
