import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Client } from "@elastic/elasticsearch";
import { arrayUnique, assertObject, assertString, okJson, stringifyArrays } from "./util";

const client = new Client({ node: "http://node-1.hska.io:9200/" });
const index = "songsv2";
var autoFuzzy = true;

async function typing(text: string): Promise<string[]> {
  const { body } = await client.search({
    index: index,
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

async function msearch(text: string, pageno: number): Promise<Record<string, any>> {
  const { body } = await client.msearch({
    index: index,
    body: [
      { }, // Query for song names
      {
        from: (pageno - 1) * 10, size: 9, fields: ["name", "id", "album", "artists"], _source: false,
        query: {
          bool: {
            should: [
              {
                match: {
                  name: {
                    query: text,
                    fuzziness: autoFuzzy ? "AUTO" : "0"
                  }
                }
              },
              {
                match: {
                  name: {
                    query: text,
                    fuzziness: autoFuzzy ? "AUTO" : "0",
                    operator: "and"
                  }
                }
              },
              {
                match_phrase: {
                  name: {
                    query: text,
                    boost: 2
                  }
                }
              }
            ]
          }
        }
      },
      { }, // Query for Artists
      {
        from: (pageno - 1) * 10, size: 9, fields: ["name", "id", "album", "artists"], _source: false,
        query: {
          bool: {
            should: [
            {
              match: {
                first_artist_kw: {
                  query: text,
                  fuzziness: autoFuzzy ? "AUTO" : "0"
                }
              }
            },
            {
              match_phrase: {
                first_artist_kw: {
                query: text,
                boost: 2
                }
              }
            }
            ]
          }
        },
        collapse: {
          field: "first_artist_kw",
          inner_hits: {
            name: "latest",
            size: 1
          }
        }
      },
      {}, // Query for albums
      {
        from: (pageno - 1) * 10, size: 9, fields: ["name", "id", "album", "artists"], _source: false,
        query: {
          match: {
            album: {
              query: text,
              fuzziness: autoFuzzy ? "AUTO" : "0",
            }
          }
        },
        aggs: {
          albums: {
            terms: { "field": "album_id", size: 9 },
            aggs: {
              relevant: {
                top_hits: {
                  size: 1,
                  _source: false,
                  fields: ["id", "album", "artists"]
                }
              }
            }
          }
        }
      }
    ]
  });

  const resp = {
    byName: body.responses[0].hits.hits.map((hit) => stringifyArrays(hit.fields)),
    byArtists: body.responses[1].hits.hits.map((hit) => stringifyArrays(hit.fields)),
    byAlbum: body.responses[2].aggregations.albums.buckets.flatMap(bucket => bucket.relevant.hits.hits.map((hit) => stringifyArrays(hit.fields)))
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
