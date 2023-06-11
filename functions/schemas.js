module.exports.schemas = {
  // JSON Schema for Boat
  boatSchema: {
    type: "object",
    required: ["name", "type", "length"],
    additionalProperties: false,
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
  },
  // JSON Schema for Load
  loadSchema: {
    type: "object",
    required: ["volume", "item"],
    additionalProperties: false,
    properties: {
      volume: {
        type: "integer",
      },
      item: {
        type: "string",
      },
    },
  },
};
