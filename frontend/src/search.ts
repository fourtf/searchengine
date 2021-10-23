import { createState } from "@hookstate/core";
import { search } from "./api";

export interface SearchQuery {
  query: string;
}

export interface Song {
  name: string;
  id: string;
}

export interface SearchResult {
  byName: Song[];
  byArtist: Song[];
  byAlbum: Song[];
}

export const isSearchingState = createState(false);
export const searchResultState = createState<SearchResult | null>(null);

let currentQuery = "";

export function performSearch(query: SearchQuery) {
  const q = JSON.stringify(query);
  currentQuery = q;
  isSearchingState.set(true);

  (async () => {
    const res = await search(query);

    if (q === currentQuery) {
      isSearchingState.set(false);
      searchResultState.set(res);
    }
  })();
}
