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
  // JSON Schema for User
  userSchema: {
    type: "object",
    required: ["name", "sub", "email", "created"],
    additionalProperties: false,
    properties: {
      name: {
        type: "string",
      },
      sub: {
        type: "string",
      },
      email: {
        type: "string",
      },
      created: {
        type: "string",
      },
    },
  },
};
