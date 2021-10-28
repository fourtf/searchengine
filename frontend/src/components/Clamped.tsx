import { Box, Tooltip } from "@mui/material";
import LinesEllipsis from "react-lines-ellipsis";
import { useRef, useState } from "react";

export default function Clamped(
  { text, maxLines, ...props }:
    & { text: string; maxLines?: number }
    & Record<string, unknown>,
) {
  const [open, setOpen] = useState(false);
  const ref = useRef<any>(null);

  let onOpen = () => {
    try {
      if (ref.current?.clamped) {
        setOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  let onClose = () => {
    setOpen(false);
  };

  return (
    <Tooltip
      title={text}
      open={open}
      onOpen={onOpen}
      onClose={onClose}
    >
      <Box {...props}>
        <LinesEllipsis
          ref={ref}
          maxLine={maxLines?.toString() ?? "1"}
          text={text}
        />
      </Box>
    </Tooltip>
  );
}
