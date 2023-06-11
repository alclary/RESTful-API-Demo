const { ValidationError } = require("express-json-validator-middleware");

module.exports.errorHandling = {
  // Error handler middleware for validation errors.
  invalidJSONSchema: (err, req, res, next) => {
    if (err instanceof ValidationError) {
      res.status(400).json({
        Error:
          "The req object is missing at least one of the required attributes",
      });
      next();
    } else {
      next(err);
    }
  },
  // Error handler middleware for JWT validation errors.
  invalidJWT: (err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
      res.status(401).send("JWT is invalid or unauthorized.");
    } else {
      next(err);
    }
  },
};
