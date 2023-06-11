const { ValidationError } = require("express-json-validator-middleware");

module.exports.errorHandling = {
  // Error handler middleware for validation errors.
  invalidJSONSchema: (err, req, res, next) => {
    if (err instanceof ValidationError) {
      res.status(400).json({
        Error:
          "The provided body attributes did not match the required schema.",
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
