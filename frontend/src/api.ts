import { SearchQuery } from "./search";
import { SearchResult, Song } from "./shared";

const apiUrl =
  !/localhost/.test(window.location.host)
    ? "https://kjcedq2g36.execute-api.us-east-1.amazonaws.com"
    : "http://localhost:3333";

export async function typing(text: string): Promise<string[]> {
  const res = await fetch(`${apiUrl}/typing?text=${encodeURIComponent(text)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((x) => x.json());

  return res.items;
}

export async function search(query: SearchQuery): Promise<SearchResult> {
  const explicit = query.allowExplicit ? "" : "&fExplicit=False";
  const year = query.year ? `&fYear=${encodeURIComponent(query.year)}` : "";

  const res = await fetch(
    `${apiUrl}/search?query=${encodeURIComponent(query.query)}${explicit}${year}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((x) => x.json());

  return res;
}

export async function songs(field: string, hit: string): Promise<Song[]> {
  const res = await fetch(
    `${apiUrl}/songs?field=${encodeURIComponent(field)}&hit=${encodeURIComponent(hit)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((x) => x.json());

  return res;
}
