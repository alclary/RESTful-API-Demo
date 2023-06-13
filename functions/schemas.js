module.exports.schemas = {
  // JSON Schema for new Boat (CREATE)
  boatCreateSchema: {
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
  // JSON Schema for new Load (CREATE)
  loadCreateSchema: {
    type: "object",
    required: ["volume", "item", "hazardous"],
    additionalProperties: false,
    properties: {
      volume: {
        type: "integer",
      },
      item: {
        type: "string",
      },
      hazardous: {
        type: "boolean",
      },
    },
  },
  // JSON Schema for updating Boat (UPDATE)
  boatUpdateSchema: {
    type: "object",
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
  // JSON Schema for updating Load (UPDATE)
  loadUpdateSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      volume: {
        type: "integer",
      },
      item: {
        type: "string",
      },
      hazardous: {
        type: "boolean",
      },
    },
  },
};
