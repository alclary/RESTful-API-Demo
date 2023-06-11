require("dotenv").config();
const { Validator } = require("express-json-validator-middleware");
const { validate } = new Validator();
const { expressjwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

// exprestjwt middleware config
let jwtConfig = {
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 50,
    jwksUri: `${process.env.AUTH_DOMAIN}/.well-known/jwks.json`,
  }),
  issuer: `${process.env.AUTH_DOMAIN}/`,
  algorithms: ["RS256"],
};

// expressjwt middleware alternatives
const requireJwtAuth = expressjwt({ ...jwtConfig });
// const decodeJwtOnly = expressjwt({ ...jwtConfig, credentialsRequired: false });

// JSON Schema for Boat
const boatSchema = {
  type: "object",
  required: ["name", "type", "length"],
  properties: {
    name: {
      type: "string",
    },
    type: {
      type: "string",
    },
    length: {
      type: "integer",
    },
  },
};
// JSON Schema for Load
const loadSchema = {
  type: "object",
  required: ["volume", "item", "creation_date"],
  properties: {
    volume: {
      type: "integer",
    },
    item: {
      type: "string",
    },
    creation_date: {
      type: "string",
    },
  },
};

module.exports.middleware = {
  validateBoatSchema: validate({ body: boatSchema }),
  validateLoadSchema: validate({ body: loadSchema }),
  requireJwtAuth,
};
