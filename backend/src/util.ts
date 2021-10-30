import { APIGatewayProxyResult } from "aws-lambda";
import { Album, Artist, Song } from "./shared";

export function assertObject(
  x: unknown,
  name: string
): asserts x is Record<string, unknown> {
  if (x instanceof Array || typeof x !== "object") {
    throw new Error(`expected ${name} to be an object`);
  }
}

export function assertString(x: unknown, name: string): asserts x is string {
  if (typeof x !== "string") {
    throw new Error(`expected ${name} to be a string`);
  }
}

export function assertStringOrUndefined(x: unknown, name: string): asserts x is string | undefined {
  if (x !== undefined && typeof x !== "string") {
    throw new Error(`expected ${name} to be a string`);
  }
}

export function assertArray(x: unknown, name: string): asserts x is unknown[] {
  if (!(x instanceof Array)) {
    throw new Error(`expected ${name} to be an array`);
  }
}

export function assertStringArray(x: unknown, name: string): asserts x is string[] {
  if (!(x instanceof Array)) {
    throw new Error(`expected ${name} to be an array`);
  }
  x.forEach((y) => assertString(y, "array element"));
}


export function assertIsSong(obj: any): asserts obj is Song {
  assertObject(obj, "song");
  assertString(obj.name, "name");
  assertString(obj.id, "id");
  assertString(obj.album, "album");
  assertStringOrUndefined(obj.coverUrl, "coverUrl");
  assertArray(obj.artists, "artists");
}

export function assertIsSongArray(obj: any): asserts obj is Song[] {
  assertArray(obj, "song array");
  obj.forEach(assertIsSong);
}


export function assertIsAlbum(obj: any): asserts obj is Album {
  assertObject(obj, "album");
  assertString(obj.name, "name");
  assertString(obj.songId, "songId");
  assertStringOrUndefined(obj.coverUrl, "coverUrl");
  assertArray(obj.artists, "artists");
}

export function assertIsAlbumArray(obj: any): asserts obj is Album[] {
  assertArray(obj, "album array");
  obj.forEach(assertIsAlbum);
}


export function assertIsArtist(obj: any): asserts obj is Artist {
  assertObject(obj, "artist");
  assertString(obj.name, "name");
  assertString(obj.songId, "songId");
  assertString(obj.artistId, "artistId");
  assertStringOrUndefined(obj.coverUrl, "coverUrl");
}

export function assertIsArtistArray(obj: any): asserts obj is Artist[] {
  assertArray(obj, "artist array");
  obj.forEach(assertIsArtist);
}


export function okJson(t: any): APIGatewayProxyResult {
  return {
    statusCode: 200,
    body: JSON.stringify(t),
    headers: { "Content-Type": "application/json" },
  };
}

export function arrayUnique<T>(xs: T[]): T[] {
  return Array.from(new Set(xs));
}

export function stringifyArrays(a: Record<string, string[]>[]): any[] {
  console.log(a);
  Object.keys(a).forEach(function (key) {
    if (key !== "artists") {
      a[key] = a[key] instanceof Array ? a[key].join() : a[key];
    }
  });
  return a;
}
