import { useHookstate } from "@hookstate/core";
import { Avatar, Box, ButtonBase, Paper } from "@mui/material";
import { useTheme } from "@mui/system";
import { searchResultState } from "../search";
import { Album, Artist, Song } from "../shared";
import { fetchSongs } from "../songs";
import Clamped from "./Clamped";
import Image from "./Image";
import { SearchResultItems } from "./SearchResultItems";
import SongResultHost from "./SongResultHost";

const size = "128px";
const sizeSm = "96px";

export default function SearchResults(props: any) {
  const res = useHookstate(searchResultState);

  return (
    <Box {...props}>
      <SearchResultItems
        items={res.get()?.songs ?? []}
        title={"Songs"}
        noElementText={"No songs found"}
        isColumn={true}
        ItemComponent={SongComponent}
        getItemKey={(x) => x.id}
      />

      <SearchResultItems
        items={res.get()?.artists ?? []}
        title="Artists"
        noElementText={"No artists found"}
        isColumn={false}
        ItemComponent={ArtistComponent}
        getItemKey={(x) => x.songId}
      />

      <SearchResultItems
        items={res.get()?.albums ?? []}
        title="Albums"
        noElementText={"No albums found"}
        isColumn={false}
        ItemComponent={AlbumComponent}
        getItemKey={(x) => x.songId}
      />

      <SongResultHost />
    </Box>
  );
}

export function SongComponent({ name, artists, album, coverUrl }: Song) {
  console.log(name);

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

export function ArtistComponent({ name, artistId, coverUrl }: Artist) {
  const theme = useTheme();

  return (
    <ButtonBase onClick={() => fetchSongs("artist_ids", artistId)}>
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
            alt={name}
            sx={{
              flexShrink: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </Paper>
        <Box sx={{ textAlign: "center" }}>
          {name}
        </Box>
      </Box>
    </ButtonBase>
  );
}

export function AlbumComponent({ name, albumId, artists, coverUrl }: Album) {
  const theme = useTheme();

  return (
    <ButtonBase onClick={() => fetchSongs("album_id", albumId)}>
      {/* <Typography variant="body2" color="textSecondary"> */}
      <Box
        sx={{
          width: size,
          marginTop: 2,

          [theme.breakpoints.down("sm")]: {
            width: sizeSm,
          },

          ":hover": {
            cursor: "pointer",
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
          maxLines={2}
        />
      </Box>
      {/* </Typography> */}
    </ButtonBase>
  );
}
