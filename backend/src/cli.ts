import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda/trigger/api-gateway-proxy";
import { handler } from "./index";

if (process.argv.length < 4) {
  console.error(
    'Usage: node dist/index.js <GET|POST|...> /my/route?a=b [{"a":"b"}]'
  );
  process.exit(1);
}

const method = process.argv[2];
const { pathname: path, searchParams } = new URL(
  `http://example.com/${process.argv[3]}`
);

(async () => {
  console.log(
    await handler({
      body: process.argv[4] ?? "",
      headers: {},
      httpMethod: method,
      isBase64Encoded: false,
      path,
      pathParameters: {},
      multiValueHeaders: {},
      queryStringParameters: searchParamsToObject(searchParams),
      multiValueQueryStringParameters: null,
      stageVariables: null,
      resource: null,
      requestContext: {
        http: { method: process.argv[2], path },
      } as any,
    })
  );
})();

function searchParamsToObject(searchParams: URLSearchParams) {
  const obj = {};

  searchParams.forEach((value, key) => {
    obj[key] = value;
  });

  return obj;
}
