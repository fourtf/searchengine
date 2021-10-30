import SpotifyWebApi from 'spotify-web-api-node';
import { Album, Artist, SearchResult, Song } from './shared';

// MAKE CLIENT
const canUseSpotify = process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET;

if (!canUseSpotify) {
    console.error("SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not set");
}

const sp = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// ACCESS TOKEN
let lastExecution: null | number = null;
const cooldown = 1000 * 60 * 30; // 30 Minutes

/**
 * Refreshes spotify token if needed.
 */
async function refreshAccessToken(): Promise<void> {
    if (lastExecution === null || Date.now() - lastExecution > cooldown) {
        lastExecution = Date.now();
        await sp.clientCredentialsGrant().then(
            (data) => {
                sp.setAccessToken(data.body.access_token);
                console.log('access token refreshed');
            },
            console.error
        );
    }
}

// FUNCTION
export async function getCoverUrls(songIds: string[]): Promise<{ [id: string]: string | undefined } | null> {
    if (!canUseSpotify) {
        return null;
    }

    await refreshAccessToken();
    const data = await sp.getTracks(songIds);

    return Object.fromEntries(data.body.tracks.map(({ id, album: { images } }) => {
        return [id, images.find(img => img.height === 300)?.url ?? images?.[0]?.url ?? null];
    }));
}

async function addCoverUrlsSearch(obj: SearchResult): Promise<SearchResult> {
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

export async function tryAddCoverUrls(obj: SearchResult): Promise<SearchResult> {
    try {
        return await addCoverUrlsSearch(obj);
    } catch (e) {
        console.error(e);
        return obj;
    }
}


export async function tryAddCoverUrlsSongs(songs: Song[]): Promise<Song[]> {
    try {
        return await tryAddCoverUrls({
            songs,
            artists: [],
            albums: []
        }).then(({ songs }) => songs);
    } catch (e) {
        console.error(e);
        return songs;
    }
}