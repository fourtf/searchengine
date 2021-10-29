import { useHookstate } from "@hookstate/core";
import { Avatar, Box, Paper } from "@mui/material";
import { useTheme } from "@mui/system";
import { Album, searchResultState, Song } from "../search";
import Clamped from "./Clamped";
import Image from "./Image";
import { SearchResultItems } from "./SearchResultItems";

const size = "128px";
const sizeSm = "96px";

export default function SearchResults(props: any) {
  const res = useHookstate(searchResultState);

  return (
    <Box {...props}>
      <SearchResultItems
        items={res.get()?.byName ?? []}
        title={"Songs"}
        isColumn={true}
        ItemComponent={SongComponent}
        getItemKey={(x) => x.id}
      />

      <SearchResultItems
        items={res.get()?.byArtists ?? []}
        title="Artists"
        isColumn={false}
        ItemComponent={ArtistComponent}
        getItemKey={(x) => x.id}
      />

      <SearchResultItems
        items={res.get()?.byAlbum ?? []}
        title="Albums"
        isColumn={false}
        ItemComponent={AlbumComponent}
        getItemKey={(x) => x.songId}
      />
    </Box>
  );
}

function SongComponent({ name, artists, album, coverUrl }: Song) {
  return (
    <Box sx={{ display: "flex", flexDirection: "row" }}>
      <Paper
        square
        elevation={3}
        sx={{ width: 48, height: 48, marginRight: 2, flexShrink: 0 }}
      >
        <Image
          src={coverUrl}
          alt={name}
          style={{ width: "100%", height: "100%" }}
          loadingElement={
            <svg
              width="128"
              height="128"
              viewBox="0 0 128 128"
              style={{ width: "100%", height: "100%" }}
            >
              <circle cx="64" cy="64" r="58" fill="#f5f5f5" />
            </svg>
          }
        />
      </Paper>
      <Box>
        <Clamped text={name} maxLines={2} />
        <Clamped
          sx={{ color: "#999" }}
          text={`${artists.join(", ")} - ${album}`}
        />
      </Box>
    </Box>
  );
}

function ArtistComponent({ artists, coverUrl }: Song) {
  const theme = useTheme();

  const artist = artists[0] ?? "???";

  return (
    <Box
      sx={{
        width: size,
        marginTop: 2,

        [theme.breakpoints.down("sm")]: {
          width: sizeSm,
        },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          flexShrink: 0,
          width: size,
          height: size,
          borderRadius: 32,
          marginBottom: 2,

          [theme.breakpoints.down("sm")]: {
            width: sizeSm,
            height: sizeSm,
            marginRight: 2,
          },
        }}
      >
        <Avatar
          src={coverUrl}
          alt={artist}
          sx={{
            flexShrink: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </Paper>
      <Box sx={{ textAlign: "center" }}>
        {artist}
      </Box>
    </Box>
  );
}

function AlbumComponent({ name, artists, coverUrl }: Album) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: size,
        marginTop: 2,

        [theme.breakpoints.down("sm")]: {
          width: sizeSm,
        },
      }}
    >
      <Paper
        square
        elevation={3}
        sx={{
          width: size,
          height: size,
          marginBottom: 2,

          [theme.breakpoints.down("sm")]: {
            width: sizeSm,
            height: sizeSm,
          },
        }}
      >
        <img
          src={coverUrl}
          alt={name}
          style={{ width: "100%", height: "100%" }}
        />
      </Paper>
      <Clamped
        sx={{ textAlign: "center" }}
        text={name}
        maxLines={2}
      />
      <Clamped
        sx={{ textAlign: "center", color: "#999" }}
        text={artists.join(", ")}
      />
    </Box>
  );
}
