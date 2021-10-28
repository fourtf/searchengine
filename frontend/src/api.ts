import { SearchQuery, SearchResult } from "./search";

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
  const res = await fetch(
    `${apiUrl}/search?query=${encodeURIComponent(query.query)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((x) => x.json());

  return res;
}
