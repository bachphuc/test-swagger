import axios from "axios";
import got from "got";
import { Cookie, CookieJar } from "tough-cookie";

// const RPM_API_BASE_URL = 'https://xncrs3.xnhotels.com/XMS/API/LocalResident/dev/'
const RPM_API_BASE_URL = 'https://xnxms.xnprotel.com/XMS/API/LocalResident/xmsWebApiQA/'
const RPM_CLIENT_ID = 'qa';
const RPM_APPLICATION = 'ResidentPortal';

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

export function getRPMApiUrl(path: string): string {
  return `${RPM_API_BASE_URL}${path}`;
}

export async function getRPMToken() {
  const accessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlJHZkViLXdya1VzZWdGRVlvVXZDSSJ9.eyJpc3MiOiJodHRwczovL2Rldi1xZWN2ejJyN2kxZmt1ZmxtLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2NWVmYzJkNDI2Nzg2MGNjYmNjY2FlM2IiLCJhdWQiOlsiaHR0cHM6Ly9kZXYtcWVjdnoycjdpMWZrdWZsbS51cy5hdXRoMC5jb20vYXBpL3YyLyIsImh0dHBzOi8vZGV2LXFlY3Z6MnI3aTFma3VmbG0udXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTc1OTI0OTE5NywiZXhwIjoxNzU5MzM1NTk3LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG9mZmxpbmVfYWNjZXNzIiwiYXpwIjoiOVU3dTdITzFYVEJod2lHTUFzSjdydk1rb0NOT0tFWVQifQ.S-XLA6xw1dgITXcBHUVOxiGptMLXKzXblv1YL0_gqJ_vlPKaMGbqhjDeimulisxGOpyLyUNqmzvr4mgm0Ij43CUQDtdTDjEkxWEFyPQQ8430a9bVC4wPNCbHPrWPDxjgbF8_ja4GxEl3jvtDlTnk4s0wG-PMoGkvrCAlqd9TZgksro6ZuunazwnXq6E0Y0Ddo0o5YmbjXpX594uFF3Y4cBPxHgWxApsYCz5DLS_HNFOeJuWp90Q3kcJ7ycMk2MEMcegM8ziB5xTsiFYMKqKQ_UESpGgDPZ9ioqKAgx_OfntaDNcV9ktAUnMUo7o0MEcVRx3PAUp7aX6_LWf2IgyvsQ';

  const cookieJar = new CookieJar();

  const response: any = await got.post(getRPMApiUrl('WBEAuthentication/token'), {
    http2: true,
    json: {
      isAdminUser: false,
      password: 'bb946ca0-88ca-42c6-880f-c3c72d0e8770',
      username: 'bb946ca0-88ca-42c6-880f-c3c72d0e8770'
    },
    headers: {
      Application: RPM_APPLICATION,
      Authorization: `Bearer ${accessToken}`,
      Clientid: RPM_CLIENT_ID
    },
    cookieJar: cookieJar
  })
  // .json();

  // console.log(response);
  console.log(`cookie=${JSON.stringify(response.headers["set-cookie"])}`);

  console.log(`body=${JSON.stringify(response.body)}`);


}

export async function readActiveBookings() {
  const cookies = [
    "access_token_residentportal=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImxxYXRpZ2VyQG1haWxpbmF0b3IuY29tIiwiaXNBZG1pblVzZXIiOiJGYWxzZSIsInByb2ZpbGVpZCI6IjEyMjAyIiwianRpIjoiZTUzNDk3ZDEtMGMyZS00YWUyLTg1YWMtNDRjMDdjZjhjM2MyIiwibmJmIjoxNzU5MjUyMjkyLCJleHAiOjE3NTkyOTU0OTIsImlhdCI6MTc1OTI1MjI5MiwiaXNzIjoiaHR0cHM6Ly94bnhtcy54bnByb3RlbC5jb20ifQ.QWEZbFSZm9i3svbFACmTe9zIkLt6bv3SYvpJ8yZFkaU; expires=Wed, 01 Oct 2025 05:11:32 GMT; path=/XMS/API/LocalResident/xmsWebApiQA/; secure; httponly",
    "refresh_token_residentportal=ty2qlAVVTciMfZd4sqF1XJ79ynUYYvnlpoxSITicGMkjtd2UNXPwVTD%2FWYOiStFemZE5SUaoxFPriTrDP96cYg%3D%3D; expires=Wed, 01 Oct 2025 17:11:32 GMT; path=/XMS/API/LocalResident/xmsWebApiQA/; secure; httponly"
  ];

  const cookieJar = new CookieJar();

  const response = await got.post(getRPMApiUrl('BTRBooking/ActiveBookings'), {
    http2: true,
    json: { "cultureCode": "en-US", "pageIndex": 1, "pageSize": 0 },
    headers: {
      Application: RPM_APPLICATION,
      Clientid: RPM_CLIENT_ID,
      Cookie: cookies.join("; ")
    },
  })
  .json();

  console.log(response);
}