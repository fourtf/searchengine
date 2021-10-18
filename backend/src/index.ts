import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Client } from "@elastic/elasticsearch";
import cli from "./cli";

const client = new Client({ node: "http://node-1.hska.io:9200/" });

async function count() {
  const count = await client.count(
    {
      index: "songs",
    },
  );

  return count.body;
}

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const requestContext = event.requestContext;
  const { http: { method, path } } = requestContext as any;

  if (path === "/songs" && method === "GET") {
    return { statusCode: 200, body: JSON.stringify(await count()) };
  } 

  return { statusCode: 200, body: JSON.stringify(event) };
};


if (require.main === module) {
  cli(handler);
}