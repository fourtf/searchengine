import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Client } from "@elastic/elasticsearch";
import { arrayUnique, assertIsAlbumArray, assertIsArtistArray, assertIsSongArray, assertObject, assertString, assertStringArray, okJson, stringifyArrays } from "./util";
import { Album, Artist, SearchResult, Song } from "./shared";
import { getCoverUrls } from "./spotify";
import { release } from "os";

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

async function searchSongsByField(field: string, text: string): Promise<Record<string, any>> {
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
  const { pageno, explicitFilter, yearFilter } = params; 
  const filter = [
    explicitFilter ? [{"term": {"explicit": explicitFilter}}] : [],
    yearFilter ? [{"term": {"year": yearFilter}}] : []
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
        // aggs: {
        //   albums: {
        //     terms: { "field": "album_id", size: 9 },
        //     aggs: {
        //       relevant: {
        //         top_hits: {
        //           size: 1,
        //           _source: false,
        //           fields: ["id", "album", "artists"]
        //         }
        //       }
        //     }
        //   }
        // }
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
      name: name[0] ?? "",
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

async function addCoverUrls(obj: SearchResult): Promise<SearchResult> {
  const ids = [...obj.songs.map(x => x.id), ...obj.artists.map(x => x.songId), ...obj.albums.map(x => x.songId)];
  const coversBySongId = await getCoverUrls(ids);

  if (ids.length === 0 || coversBySongId === null) {
    return obj;
  }

  function map<T extends Song | Album | Artist>(t: T): T {
    return {
      ...t,
      coverUrl: coversBySongId["songId" in t ? t.songId : t.id]
    };

  }

  return {
    songs: obj.songs.map(map),
    artists: obj.artists.map(map),
    albums: obj.albums.map(map),
  };
}

async function tryAddCoverUrls(obj: SearchResult): Promise<SearchResult> {
  try {
    return await addCoverUrls(obj);
  } catch (e) {
    console.error(e);
    return obj;
  }
}

interface parameters {
  pageno: number,
  explicitFilter: string,
  yearFilter: string
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
        const { query, p, fExplicit, fYear } = event.queryStringParameters ?? {};
        const params = { pageno: p ? parseInt(p) : 1, explicitFilter: fExplicit, yearFilter: fYear};
        assertString(query, "query");
        
        // Returns in format {
        // byName: [{name: "xyz", id: "123"}],
        // byArtists: [{name: "xyz", id: "123"}],
        // byAlbum: [{name: "xyz", id: "123"}]^^
        // }
        return okJson(await msearch(query, params).then(tryAddCoverUrls));
      case "/songs":
        const { field, hit } = event.queryStringParameters ?? {};
        assertString(field, "field");
        assertString(hit, "hit");
        return okJson(await searchSongsByField(field, hit));
    }
  }

  return okJson(event);
};
