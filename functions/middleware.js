require("dotenv").config();
const { Validator } = require("express-json-validator-middleware");
const { expressjwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const { schemas } = require("./schemas");

const { validate } = new Validator();

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

module.exports.middleware = {
  validateBoatSchema: validate({ body: schemas.boatSchema }),
  validateLoadSchema: validate({ body: schemas.loadSchema }),
  validateBoatSchema: validate({ body: boatSchema }),
  validateLoadSchema: validate({ body: loadSchema }),
  requireJwtAuth,
};
