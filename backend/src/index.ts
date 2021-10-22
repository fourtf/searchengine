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

async function scroll(scroll_id: string): Promise<any> {
  const { body } = await client.scroll({
    scroll_id: scroll_id,
    scroll: '1m'
  })

  return {next_page: body._scroll_id, data: body.hits.hits.map((hit) => hit.fields.name)};
}



async function search(text: string): Promise<Record<string, any>> {
  const { body } = await client.search({
    index: "songs",
    scroll: '1m',
    size: 10,
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

  if (path === "/songs" && method === "GET") {
    return okJson(await count());
  }
  if (path === "/typing" && method === "GET") {
    const { text } = event.queryStringParameters ?? {};
    assertString(text, "text");

    return okJson({ items: await typing(text) });
  }
  if (path === "/search" && method === "GET") {
    const { query, next } = event.queryStringParameters ?? {};
    assertString(query, "query");
    if (next) {
      return okJson({items: await scroll(next)});
    }

    return okJson({items: await search(query)});
  }

  if (method === 'GET') {
    switch(path) {
      case '/songs':
        return okJson(await count());
      case '/typing':
        const { text } = event.queryStringParameters ?? {};
        assertString(text, "text");

        return okJson({items: await typing(text)});
      case '/search':
        const { query, next } = event.queryStringParameters ?? {};
        assertString(query, "query");

        if (next) {
          return okJson({items: await scroll(next)});
        }
        return okJson({items: await search(query)});
    }
  }

  return okJson(event);
};
