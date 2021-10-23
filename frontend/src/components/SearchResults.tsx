import { useHookstate } from "@hookstate/core";
import { Box, Card, Typography } from "@mui/material";
import { searchResultState } from "../search";

export default function SearchResults(props: any) {
  const res = useHookstate(searchResultState);

  return (
    <Box {...props}>
      <Category title="Songs">
        {(res.get()?.byName ?? []).map((x) => <Result key={x.id} {...x} />)}
      </Category>
      <Category title="Artists">
        {(res.get()?.byArtist ?? []).map((x) => <Result key={x.id} {...x} />)}
      </Category>
      <Category title="Albums">
        {(res.get()?.byAlbum ?? []).map((x) => <Result key={x.id} {...x} />)}
      </Category>
    </Box>
  );
}

function Category({ title, children }: { title: string; children: any }) {
  return (
    <Card sx={{ marginTop: 2, padding: 2, marginLeft: 4, marginRight: 4 }}>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        {title}
      </Typography>

      {children}
    </Card>
  );
}

function Result({ name }: { name: string }) {
  return (
    <div>
      {name}
    </div>
  );
}
