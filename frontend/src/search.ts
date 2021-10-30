import { createState } from "@hookstate/core";
import { search } from "./api";
import { SearchResult } from "./shared";

export interface SearchQuery {
  query: string;
  allowExplicit: boolean;
  year: string;
}

export const isSearchingState = createState(false);
export const searchResultState = createState<SearchResult | null>(null);

let currentQuery = "";

export function performSearch(query: SearchQuery) {
  const q = JSON.stringify(query);
  currentQuery = q;
  isSearchingState.set(true);

  (async () => {
    try {
      const res = await search(query);

      if (q === currentQuery) {
        isSearchingState.set(false);
        searchResultState.set(res);
      }
    } catch (e) {
      console.error(e);
    }
  })();
}
