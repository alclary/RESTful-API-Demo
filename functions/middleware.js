const { Validator } = require("express-json-validator-middleware");
const { validate } = new Validator();

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
};
