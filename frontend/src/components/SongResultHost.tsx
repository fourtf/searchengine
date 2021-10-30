import { useHookstate } from "@hookstate/core";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/system/Box";
import { songsDialogOpenState, songsState } from "../songs";
import { SongComponent } from "./SearchResults";

export default function SongResultHost() {
  const songs = useHookstate(songsState);
  const open = useHookstate(songsDialogOpenState);

  return (
    <Dialog
      open={open.get()}
      onClose={() => songsDialogOpenState.set(false)}
      maxWidth="md"
      fullWidth={true}
    >
      <Box sx={{ margin: 4 }}>
        {songs.get()?.map((song) => (
          <Box sx={{ marginTop: 2 }}>
            <SongComponent {...song} key={song.id} />
          </Box>
        ))}
      </Box>
    </Dialog>
  );
}
