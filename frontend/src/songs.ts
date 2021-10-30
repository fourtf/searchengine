import { createState } from "@hookstate/core";
import { songs } from "./api";
import { Song } from "./shared";

export const isFetchingSongsState = createState(false);
export const songsState = createState<Song[] | null>(null);
export const songsDialogOpenState = createState(false);

let currentQuery = "";

export function fetchSongs(field: string, hit: string) {
    const q = JSON.stringify({ field, hit });
    currentQuery = q;
    isFetchingSongsState.set(true);
    songsDialogOpenState.set(true);

    (async () => {
        try {
            const res = await songs(field, hit);

            if (q === currentQuery) {
                isFetchingSongsState.set(false);
                songsState.set(res);
            }
        } catch (e) {
            console.error(e);
        }
    })();
}

export const isSearchingState = createState(false);
export const searchResultState = createState<Song[] | null>(null);
