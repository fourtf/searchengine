import { APIGatewayProxyResult } from "aws-lambda";

export function assertObject(
  x: unknown,
  name: string
): asserts x is Record<string, unknown> {
  if (x instanceof Array || typeof x !== "object") {
    throw new Error(`expected ${name} to be an object`);
  }
}

export function assertString(x: unknown, name: string): asserts x is string {
  if (typeof x !== "string") {
    throw new Error(`expected ${name} to be a string`);
  }
}

export function okJson(t: any): APIGatewayProxyResult {
  return {
    statusCode: 200,
    body: JSON.stringify(t),
    headers: { "Content-Type": "application/json" },
  };
}
