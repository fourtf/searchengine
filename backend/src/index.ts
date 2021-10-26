import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Client } from "@elastic/elasticsearch";
import { arrayUnique, assertObject, assertString, okJson, stringifyArrays } from "./util";

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

  return arrayUnique(body.hits.hits.map((hit) => hit.fields.name).flat());
}

async function search(
  text: string,
  pageno: number
): Promise<Record<string, any>> {
  const { body } = await client.search({
    index: "songs",
    from: (pageno - 1) * 10,
    size: 9,
    body: {
      query: {
        match: {
          name: {
            query: text,
            fuzziness: autoFuzzy ? "AUTO" : "0",
          },
        },
      },
      fields: ["name"],
      _source: false,
    },
  });

  return body.hits.hits.map((hit) => hit.fields.name);
}

async function msearch(text: string, pageno: number): Promise<Record<string, any>> {
  const { body } = await client.msearch({
    index: "songs",
    body: [
      { },
      {
        from: (pageno - 1) * 10, size: 9, fields: ["name", "id", "album", "artists"], _source: false,
        query: {
          match: {
            name: {
              query: text,
              fuzziness: autoFuzzy ? "AUTO" : "0",
            }
          }
        }
      },
      { },
      {
        from: (pageno - 1) * 10, size: 9, fields: ["name", "id", "album", "artists"], _source: false,
        query: {
          match: {
            artists: {
              query: text,
              fuzziness: autoFuzzy ? "AUTO" : "0",
            }
          }
        }
      },
      { },
      {
        from: (pageno - 1) * 10, size: 9, fields: ["name", "id", "album", "artists"], _source: false,
        query: {
          match: {
            album: {
              query: text,
              fuzziness: autoFuzzy ? "AUTO" : "0",
            }
          }
        }
      }
    ]
  });

  const resp = {
    byName: body.responses[0].hits.hits.map((hit) => stringifyArrays(hit.fields)),
    byArtists: body.responses[1].hits.hits.map((hit) => stringifyArrays(hit.fields)),
    byAlbum: body.responses[2].hits.hits.map((hit) => stringifyArrays(hit.fields))
  }

  return resp;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const requestContext = event.requestContext;
  const {
    http: { method, path },
  } = requestContext as any;

  if (method === "GET") {
    switch (path) {
      case "/songs":
        return okJson(await msearch("Gunna", 1));
      case "/typing":
        const { text } = event.queryStringParameters ?? {};
        assertString(text, "text");
        return okJson({ items: await typing(text) });
      case "/search":
        const { query, p } = event.queryStringParameters ?? {};
        assertString(query, "query");
        const pageno = p ? parseInt(p) : 1;

        // Returns in format {
          // byName: [{name: "xyz", id: "123"}],
          // byArtists: [{name: "xyz", id: "123"}],
          // byAlbum: [{name: "xyz", id: "123"}]
        // }
        return okJson(await msearch(query, pageno));
    }
  }

  return okJson(event);
};
