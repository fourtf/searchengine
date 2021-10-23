import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Client } from "@elastic/elasticsearch";
import { assertObject, assertString, okJson } from "./util";

const client = new Client({ node: "http://node-1.hska.io:9200/" });
var autoFuzzy = true;

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

async function search(text: string, pageno: number): Promise<Record<string, any>> {
  const { body } = await client.search({
    index: "songs",
    from: (pageno - 1) * 10,
    size: 9,
    body: {
      query: {
        match: {
          name: {
            query: text,
            fuzziness: autoFuzzy ? "AUTO" : "0"
          }
        }
      },
      fields: ["name"],
      _source: false
    }
  });

  return {next_page: body._scroll_id, data: body.hits.hits.map((hit) => hit.fields.name)};
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const requestContext = event.requestContext;
  const {
    http: { method, path },
  } = requestContext as any;

  if (method === 'GET') {
    switch(path) {
      case '/songs':
        return okJson(await count());
      case '/typing':
        const { text } = event.queryStringParameters ?? {};
        assertString(text, "text");
        return okJson({items: await typing(text)});
      case '/search':
        const { query, p } = event.queryStringParameters ?? {};
        assertString(query, "query");
        const pageno = p ? parseInt(p) : 1;

        return okJson({items: await search(query, pageno)});
    }
  }

  return okJson(event);
};
