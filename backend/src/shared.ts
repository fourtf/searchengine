export interface SearchResult {
    songs: Song[];
    artists: Artist[];
    albums: Album[];
}

export interface Song {
    name: string;
    id: string;
    album: string;
    artists: string[];
    coverUrl?: string;
}

export interface Album {
    name: string;
    songId: string;
    albumId: string;
    artists: string[];
    coverUrl?: string;
}

export interface Artist {
    name: string;
    songId: string;
    artistId: string;
    coverUrl?: string;
}