import { useHookstate } from "@hookstate/core";
import { CircularProgress } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/system/Box";
import {
  isFetchingSongsState,
  songsDialogOpenState,
  songsState,
} from "../songs";
import { justifyCenter } from "../util";
import { SongComponent } from "./SearchResults";

export default function SongResultHost() {
  const songs = useHookstate(songsState);
  const open = useHookstate(songsDialogOpenState);
  const isLoading = useHookstate(isFetchingSongsState);

  return (
    <Dialog
      open={open.get()}
      onClose={() => songsDialogOpenState.set(false)}
      fullWidth={true}
    >
      <Box sx={{ margin: 2 }}>
        {isLoading.get()
          ? (
            <Box sx={{ ...justifyCenter }}>
              <CircularProgress />
            </Box>
          )
          : songs.get()?.map((song) => (
            <Box sx={{ marginTop: 2 }} key={song.id}>
              <SongComponent {...song} />
            </Box>
          ))}
      </Box>
    </Dialog>
  );
}
