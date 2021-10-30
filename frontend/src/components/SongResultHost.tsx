import { useHookstate } from "@hookstate/core";
import Dialog from "@mui/material/Dialog";
import { songsDialogOpenState, songsState } from "../songs";
import { SongComponent } from "./SearchResults";

export default function SongResultHost() {
  const songs = useHookstate(songsState);
  const open = useHookstate(songsDialogOpenState);

  return (
    <Dialog
      open={open.get()}
      onClose={() => songsDialogOpenState.set(false)}
    >
      {songs.get()?.map((song) => <SongComponent {...song} key={song.id} />)}
    </Dialog>
  );
}
