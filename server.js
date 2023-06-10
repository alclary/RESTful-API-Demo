// Imports
const express = require("express");
const cors = require("cors");
const { auth } = require("express-openid-connect");
const { errorHandling } = require("./functions/errorHandling.js");

// Import Routes
const boats = require("./routes/boatRoutes.js");
const loads = require("./routes/loadRoutes.js");
const users = require("./routes/userRoutes.js");

// Express configuration
const app = express();
const port = 8080;

// Auth0 configuration
const autoConfig = {
  authRequired: false,
  auth0Logout: true,
  baseURL: process.env.BASE_PATH,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.AUTH_DOMAIN,
  secret: process.env.SECRET,
};

// Enable CORS for localhost origin
app.use(cors({ origin: "*" }));

// Middlewares
app.use(express.json());
app.use(auth(autoConfig)); // attaches /login, /logout, /callback to base url

//Configure routes
app.use("/boats", boats);
app.use("/loads", loads);
app.use("/users", users);

// Base Routes
app.get("/", (req, res) => {
  res.set("Content-Type", "text/html");
  if (req.oidc.isAuthenticated()) {
    res.send(`
    <h1>Portfolio Project: RESTful API with Authorization</h1>
    <p>Anthony L Clary (claryan)</p>
    <h2> Welcome ${req.oidc.user.name}!</h2>
    <ul>
      <li><b>User info:</b> ${JSON.stringify(req.oidc.user, null, 2)}</li>
      <li><b>JWT:</b> ${JSON.stringify(req.oidc.idToken, null, 2)}</li>
    </ul>
    <a href="${process.env.BASE_PATH}/logout">Logout</a>`);
  } else {
    res.send(`
    <h1>Portfolio Project: RESTful API with Authorization</h1>
    <a href="${process.env.BASE_PATH}/login">Login</a>`);
  }
});

// Error handling
app.use(errorHandling.validateJSONSchema);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
