import Box from "@mui/material/Box";
import { justifyCenter } from "../util";
import Card from "@mui/material/Card";
import Logo from "./Logo";
import useTheme from "@mui/material/styles/useTheme";
import { SearchInput } from "./SearchInput";
import SearchResults from "./SearchResults";
import { useHookstate } from "@hookstate/core";
import { searchResultState } from "../search";
import { Fragment } from "react";

export default function SearchComponent() {
  const theme = useTheme();
  const results = useHookstate(searchResultState);

  return (
    <Box
      sx={{
        transition: "all 0.2s ease-out",
        marginTop: results.get() === null ? 16 : 4,
        [theme.breakpoints.down("sm")]: {
          marginTop: 2,
        },
      }}
    >
      <Box sx={{ ...justifyCenter }}>
        <Logo
          singleLine={true}
          sx={{
            marginBottom: 2,
            [theme.breakpoints.up("sm")]: { display: "none" },
          }}
        />
      </Box>
      <Card
        sx={{
          width: "100%",
          padding: 2,
          paddingTop: 2,
          paddingBottom: 2,
          boxShadow: 2,
          [theme.breakpoints.down("sm")]: {
            padding: 2,
          },
        }}
      >
        <SearchInput sx={{ flex: 1 }} />
      </Card>

      {results.get() === null
        ? <Fragment />
        : <SearchResults sx={{ marginTop: 2 }} />}
    </Box>
  );
}
