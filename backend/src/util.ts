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

export function arrayUnique<T>(xs: T[]): T[] {
  return Array.from(new Set(xs));
}

export function stringifyArrays(a: Record<string, string[]>[]): any[] {
  Object.keys(a).forEach(function(key) {
    a[key] = a[key] instanceof Array ? a[key].join() : a[key];
  });
  return a;
}
