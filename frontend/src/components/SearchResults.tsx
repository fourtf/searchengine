import { useHookstate } from "@hookstate/core";
import { Box, Card, Paper, Typography } from "@mui/material";
import { searchResultState, Song } from "../search";
import { justifyCenter } from "../util";

export default function SearchResults(props: any) {
  const res = useHookstate(searchResultState);

  console.log(res.get()?.byArtists);

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
        {(res.get()?.byArtists ?? []).map((x) => <Artist key={x.id} {...x} />)}
      </Category>
      <Category
        title="Albums"
        sx={{
          display: "flex",
          flexDirection: "row",
          ["> *"]: { marginRight: 2 },
        }}
      >
        {(res.get()?.byAlbum ?? []).map((x) => <Album key={x.id} {...x} />)}
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

function Song_({ name, artists, album }: Song) {
  return (
    <Box sx={{ display: "flex", flexDirection: "row" }}>
      <Paper
        square
        elevation={3}
        sx={{ width: 48, height: 48, marginRight: 2 }}
      >
        <svg
          width="128"
          height="128"
          viewBox="0 0 128 128"
          style={{ width: "100%", height: "100%" }}
        >
          <circle cx="64" cy="64" r="58" fill="#f5f5f5" />
        </svg>
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

function Artist({ artists }: Song) {
  return (
    <Box>
      <Paper
        elevation={3}
        sx={{ width: 128, height: 128, marginBottom: 2, borderRadius: 32 }}
      >
      </Paper>
      <Box sx={{ textAlign: "center" }}>
        {artists.join(", ")}
      </Box>
    </Box>
  );
}

function Album({ album, artists }: Song) {
  return (
    <Box>
      <Paper
        square
        elevation={3}
        sx={{ width: 128, height: 128, marginBottom: 2 }}
      >
        <svg width="128" height="128">
          <circle cx="64" cy="64" r="58" fill="#f5f5f5" />
        </svg>
      </Paper>
      <Box sx={{ textAlign: "center" }}>
        {album}
      </Box>
      <Box sx={{ textAlign: "center", color: "#999" }}>
        {artists.join(", ")}
      </Box>
    </Box>
  );
}
