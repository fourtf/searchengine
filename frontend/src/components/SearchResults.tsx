import { useHookstate } from "@hookstate/core";
import { Box, Card, Paper, Typography } from "@mui/material";
import { Fragment } from "react";
import { Album, searchResultState, Song } from "../search";
import Image from "./Image";

export default function SearchResults(props: any) {
  const res = useHookstate(searchResultState);

  return (
    <Box {...props}>
      <Category
        title="Songs"
        sx={{
          ["> *:not(:first-child)"]: { marginTop: 2 },
        }}
      >
        {(res.get()?.byName ?? []).map((x) => <Song_ key={x.id} {...x} />)}
      </Category>
      <Category
        title="Artists"
        sx={{
          display: "flex",
          flexDirection: "row",
          ["> *"]: { marginRight: 2 },
        }}
      >
        {(res.get()?.byArtists ?? []).map((x) => <Artist_ key={x.id} {...x} />)}
      </Category>
      <Category
        title="Albums"
        sx={{
          display: "flex",
          flexDirection: "row",
          ["> *"]: { marginRight: 2 },
        }}
      >
        {(res.get()?.byAlbum ?? []).map((x) => (
          <Album_
            key={x.songId}
            {...x}
          />
        ))}
      </Category>
    </Box>
  );
}

function Category(
  { title, children, ...props }: {
    title: string;
    children: any;
    [x: string]: any;
  },
) {
  return (
    <Card
      sx={{ marginTop: 2, padding: 2, marginLeft: 4, marginRight: 4 }}
    >
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        {title}
      </Typography>

      <Box {...props}>
        {children}
      </Box>
    </Card>
  );
}

function Song_({ name, artists, album, coverUrl }: Song) {
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
        <Box sx={{}}>
          {name}
        </Box>
        <Box sx={{ color: "#999" }}>
          {artists.join(", ")} - {album}
        </Box>
      </Box>
    </Box>
  );
}

function Artist_({ artists, coverUrl }: Song) {
  const size = 128;

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{ width: size, height: size, marginBottom: 2, borderRadius: 32 }}
      >
        <Image
          src={coverUrl}
          alt={artists.join(", ")}
          style={{
            width: "100%",
            height: "100%",
            clipPath: "circle(60px at center)",
          }}
        />
      </Paper>
      <Box sx={{ textAlign: "center" }}>
        {artists.join(", ")}
      </Box>
    </Box>
  );
}

function Album_({ name, artists, coverUrl }: Album) {
  const size = 128;

  return (
    <Box>
      <Paper
        square
        elevation={3}
        sx={{ width: 128, height: 128, marginBottom: 2 }}
      >
        <Image
          src={coverUrl}
          alt={name}
          style={{ width: "100%", height: "100%" }}
          loadingElement={
            <svg width={size} height={size}>
              <circle cx="64" cy="64" r="58" fill="#f5f5f5" />
            </svg>
          }
        />
      </Paper>
      <Box sx={{ textAlign: "center" }}>
        {name}
      </Box>
      <Box sx={{ textAlign: "center", color: "#999" }}>
        {artists.join(", ")}
      </Box>
    </Box>
  );
}
