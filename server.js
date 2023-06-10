// Import Routes
const boats = require("./routes/boats.js");
const loads = require("./routes/loads.js");

// Express configuration
const express = require("express");
const app = express();
const port = 8080;

// Enable express json middleware
app.use(express.json());

// Enable CORS for localhost origin
const cors = require("cors");
app.use(cors({ origin: "*" }));

app.use("/boats", boats);

app.use("/loads", loads);

app.get("/", (req, res) => {
  res.set("Content-Type", "text/html");
  res.send(
    Buffer.from(
      "<h2>Assignment 4: Intermediate Rest API</h2><p>Anthony Logan Clary</p>"
    )
  );
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
