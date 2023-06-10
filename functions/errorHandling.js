const { ValidationError } = require("express-json-validator-middleware");

module.exports.errorHandling = {
  // Error handler middleware for validation errors.
  validateJSONSchema: (error, request, response, next) => {
    if (error instanceof ValidationError) {
      response.status(400).json({
        Error:
          "The request object is missing at least one of the required attributes",
      });
      next();
    } else {
      next(error);
    }
  },
};
