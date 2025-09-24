// "ZenithPaymendMethodRQ": {
//   "required": [
//     "distributionCode",
//     "domainCode",
//     "hotelRefID"
//   ],
//   "type": "object",
//   "properties": {
//     "hotelRefID": {
//       "minLength": 1,
//       "type": "string"
//     },
//     "domainCode": {
//       "minLength": 1,
//       "type": "string"
//     },
//     "paymentContext": {
//       "type": "integer",
//       "format": "int32"
//     },
//     "invoicePaymentAllocationItems": {
//       "type": "array",
//       "items": {
//         "$ref": "#/components/schemas/ApiInvoicePaymentAllocationItem"
//       },
//       "nullable": true
//     },
//     "platformCode": {
//       "type": "string",
//       "nullable": true
//     },
//     "paymentRequestAllocationItems": {
//       "type": "array",
//       "items": {
//         "$ref": "#/components/schemas/ApiPaymentRequestAllocationItem"
//       },
//       "nullable": true
//     },
//     "bookingNumber": {
//       "type": "string",
//       "nullable": true
//     },
//     "recurringType": {
//       "$ref": "#/components/schemas/ApiRecurringType"
//     }
//   },
//   "additionalProperties": false
// }

export type SWModelType = 'string' | 'array' | 'integer' | 'object' | 'number' | 'boolean';

export interface SWModelPropertyType{
  type: SWModelType,
  format?: string,
  minLength?: number,
  
  nullable?: boolean,
  '$ref'?: string,
}

export interface SWModel{
  required?: string[],
  type?: SWModelType,
  properties: {[key: string]: SWModelPropertyType},
  additionalProperties?: boolean,
}