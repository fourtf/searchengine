import { Typography } from "@mui/material";
import Box from "@mui/system/Box";
import { Fragment } from "react";

export default function Logo(props: any | { singleLine?: boolean }) {
  return (
    <Box {...props}>
      <Typography variant="button">
        <Box
          sx={{
            background: "linear-gradient(45deg, #FE6B8B 20%, #30AEFF 100%)",
            backgroundClip: "text",
            color: "transparent",
            fontSize: "1.7rem",
            lineHeight: "1",
            fontWeight: "800",
          }}
        >
          Jam{!props.singleLine ? <br /> : <Fragment />}Jam
        </Box>
      </Typography>
    </Box>
  );
}
