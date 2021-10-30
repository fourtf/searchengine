import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Client } from "@elastic/elasticsearch";
import { arrayUnique, assertIsAlbumArray, assertIsArtistArray, assertIsSongArray, assertObject, assertString, assertStringArray, okJson, stringifyArrays } from "./util";
import { Album, Artist, SearchResult, Song } from "./shared";
import { getCoverUrls, tryAddCoverUrls, tryAddCoverUrlsSongs } from "./spotify";

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

async function searchSongsByField(field: string, text: string): Promise<Song[]> {
  const { body } = await client.search({
    index: index,
    body: {
      size: 50, fields: ["name", "id", "album", "artists"], _source: false,
      query: {
        match_phrase: {
          [field]: text
        }
      }
    }
  });

  return body.hits.hits.map((hit) => stringifyArrays(hit.fields));
}

async function msearch(text: string, params: parameters): Promise<Record<string, any>> {
  const { pageno, explicitFilter, yearFilter, durationFilter } = params;
  const filter = [
    explicitFilter ? [{ "term": { "explicit": explicitFilter } }] : [],
    yearFilter ? [{ "term": { "year": yearFilter } }] : [],
    durationFilter ? [{ "range": { "duration_ms": { "gte": 0, "lte": durationFilter } } }] : []
  ].flat();

  const { body } = await client.msearch({
    index: index,
    body: [
      {}, // Query for song names
      {
        from: (pageno - 1) * 10, size: 10, fields: ["name", "id", "album", "artists", "explicit", "year"], _source: false,
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
            ],
            filter
          }
        }
      },
      {}, // Query for Artists
      {
        from: (pageno - 1) * 10, size: 10, fields: ["name", "id", "artists", "artist_ids"], _source: false,
        query: {
          bool: {
            should: [
              {
                match: {
                  first_artist: {
                    query: text,
                    fuzziness: autoFuzzy ? "AUTO" : "0"
                  }
                }
              },
              {
                match_phrase: {
                  first_artist: {
                    query: text,
                    boost: 2
                  }
                }
              }
            ],
            filter
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
        from: (pageno - 1) * 10, size: 10, fields: ["name", "id", "album", "artists", "album_id"], _source: false,
        query: {
          bool: {
            should: [
              {
                match: {
                  album: {
                    query: text,
                    fuzziness: autoFuzzy ? "AUTO" : "0",
                  }
                }
              },
              {
                match: {
                  artist: {
                    query: text,
                    fuzziness: autoFuzzy ? "AUTO" : "0",
                  }
                }
              }
            ],
            filter
          }
        },
        collapse: {
          field: "album_id",
          inner_hits: {
            name: "latest",
            size: 1
          }
        }
      }
    ]
  });

  const songs = body.responses[0].hits.hits.map((hit) => stringifyArrays(hit.fields)) as unknown;
  const artists = body.responses[1].hits.hits.map((hit): Artist => {
    const { name, id, artists, artist_ids } = hit.fields;
    assertStringArray(name, "name");
    assertStringArray(id, "id");
    assertStringArray(artists, "artists");
    assertStringArray(artist_ids, "artist_ids");

    return {
      name: artists[0] ?? "",
      songId: id[0] ?? "",
      artistId: artist_ids[0] ?? ""
    };
  });
  const albums = body.responses[2].hits.hits.map((hit): Album => {
    const { id, album, artists, album_id } = hit.fields as Record<string, unknown>;
    assertStringArray(id, "id");
    assertStringArray(album, "album");
    assertStringArray(artists, "artists");
    assertStringArray(album_id, "album_id");

    return {
      songId: id[0] ?? "",
      name: album[0] ?? "",
      artists,
      albumId: album_id[0] ?? "",
    };
  });

  assertIsSongArray(songs);
  assertIsArtistArray(artists);
  assertIsAlbumArray(albums);

  return { songs, artists, albums };
}

interface parameters {
  pageno: number,
  explicitFilter: string,
  yearFilter: string,
  durationFilter: number
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
        const { query, p, fExplicit, fYear, fDuration } = event.queryStringParameters ?? {};
        const params = { pageno: p ? parseInt(p) : 1, explicitFilter: fExplicit, yearFilter: fYear, durationFilter: fDuration ? parseInt(fDuration) : 0 };
        assertString(query, "query");

        return okJson(await msearch(query, params).then(tryAddCoverUrls));
      case "/songs":
        const { field, hit } = event.queryStringParameters ?? {};
        assertString(field, "field");
        assertString(hit, "hit");

        return okJson(await searchSongsByField(field, hit).then(tryAddCoverUrlsSongs));
    }
  }
  return okJson(event);
};
