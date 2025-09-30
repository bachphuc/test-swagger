type Schema = {
  [key: string]: any;
};

const schema: Schema = {
  APIDynamicRulesRentUtility: {
    type: "object",
    properties: {
      roomTypeCode: { type: "string", nullable: true },
      isChargeFullMonthBeforeSpecicDays: { type: "boolean" },
      chargeFullMonthBeforeSpecicDay: { type: "integer", format: "int32" },
      rateChargeType: { $ref: "#/components/schemas/ApiRateChargeType" },
      isAppliedSamePackages: { type: "boolean" },
      refID: { type: "string", nullable: true },
      isOpenEndedContract: { type: "boolean" },
      totalMonthsOpenEndedContract: { type: "integer", format: "int32" },
    },
    additionalProperties: false,
  },
  ApiRateChargeType: {
    enum: ["HaftRate", "ProRataRate"],
    type: "string",
    description: "HaftRate / ProRataRate",
    "x-enumNames": ["HaftRate", "ProRataRate"],
  },
};

function generateObjectInstance(objectType: string): any {
  const definition = schema[objectType];

  if (!definition) {
    throw new Error(`Schema for type '${objectType}' not found`);
  }

  // Handle enums (like ApiRateChargeType)
  if (definition.enum) {
    // Just return the first enum value (or random if you prefer)
    return definition.enum[definition.enum.length - 1];
  }

  // Handle objects
  if (definition.type === "object" && definition.properties) {
    const obj: any = {};
    for (const [key, propDef] of Object.entries<any>(definition.properties)) {
      obj[key] = getDefaultValue(propDef);
    }
    return obj;
  }

  throw new Error(`Unsupported schema type for '${objectType}'`);
}

function getDefaultValue(propDef: any): any {
  if (propDef.$ref) {
    // Extract referenced type
    const ref = propDef.$ref.split("/").pop();
    return generateObjectInstance(ref!);
  }

  switch (propDef.type) {
    case "string":
      return propDef.nullable ? null : propDef.example ?? propDef.title ?? propDef.format ?? "string";
    case "boolean":
      return false;
    case "integer":
      return 12; // arbitrary default
    case "number":
      return 0.0;
    case "object":
      return {};
    case "array":
      return [];
    default:
      return null;
  }
}
