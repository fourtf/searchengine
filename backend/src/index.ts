import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Client } from "@elastic/elasticsearch";
import { arrayUnique, assertStringArray, assertIsAlbumArray, assertIsSongArray, assertString, okJson, QueryResult, Song, stringifyArrays, Album } from "./util";
import { getCoverUrls } from "./spotify";

const client = new Client({ node: "http://node-1.hska.io:9200/" });
const index = "songsv2";
var autoFuzzy = true;

async function count() {
  const count = await client.count({
    index: "songs",
  });

  return count.body;
}

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


async function msearch(text: string, pageno: number): Promise<QueryResult> {
  const { body } = await client.msearch({
    index: index,
    body: [
      {},
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
      {},
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
      {},
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


  const byName = body.responses[0].hits.hits.map((hit) => stringifyArrays(hit.fields)) as unknown;
  const byArtists = body.responses[1].hits.hits.map((hit) => stringifyArrays(hit.fields) as unknown);
  const byAlbum = body.responses[2].aggregations.albums.buckets.flatMap(bucket => bucket.relevant.hits.hits.map((hit): Album => {
    const { id, album, artists } = hit.fields as Record<string, unknown>;
    assertStringArray(id, "id");
    assertStringArray(album, "album");
    assertStringArray(artists, "artists");

    return {
      songId: id[0] ?? "",
      name: album[0] ?? "",
      artists,
    };
  }));

  assertIsSongArray(byArtists);
  assertIsSongArray(byName);
  assertIsAlbumArray(byAlbum);

  return { byName, byArtists, byAlbum };
}

async function addCoverUrls(obj: QueryResult): Promise<QueryResult> {
  const ids = [...obj.byName.map(x => x.id), ...obj.byArtists.map(x => x.id), ...obj.byAlbum.map(x => x.songId)];
  const coversBySongId = await getCoverUrls(ids);

  if (ids.length === 0) {
    return obj;
  }

  function map<T extends Song | Album>(t: T): T {
    return {
      ...t,
      coverUrl: coversBySongId["songId" in t ? t.songId : t.id]
    };
  }

  return {
    byName: obj.byName.map(map),
    byArtists: obj.byArtists.map(map),
    byAlbum: obj.byAlbum.map(map),
  };
}

async function tryAddCoverUrls(obj: QueryResult): Promise<QueryResult> {
  try {
    return await addCoverUrls(obj);
  } catch (e) {
    console.error(e);
    return obj;
  }
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
        //   byName: [{name: "xyz", id: "123"}],
        //   byArtists: [{name: "xyz", id: "123"}],
        //   byAlbum: [{name: "xyz", id: "123"}]
        // }
        return okJson(await msearch(query, pageno).then(tryAddCoverUrls));
    }
  }

  return okJson(event);
};
