import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Client } from "@elastic/elasticsearch";
import { assertObject, assertString, okJson } from "./util";

const client = new Client({ node: "http://node-1.hska.io:9200/" });

async function count() {
  const count = await client.count({
    index: "songs",
  });

  return count.body;
}

async function typing(text: string): Promise<string[]> {
  const { body } = await client.search({
    index: "songs",
    body: {
      query: {
        match_phrase_prefix: {
          name: text,
        },
      },
      fields: ["name"],
      _source: false,
    },
  });

  return body.hits.hits.map((hit) => hit.fields.name);
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const requestContext = event.requestContext;
  const {
    http: { method, path },
  } = requestContext as any;

  if (path === "/songs" && method === "GET") {
    return okJson(await count());
  }
  if (path === "/typing" && method === "GET") {
    const { text } = event.queryStringParameters ?? {};
    assertString(text, "text");

    return okJson({ items: await typing(text) });
  }

  return okJson(event);
};
