import Box from "@mui/material/Box";
import { alignCenter, justifyCenter } from "../util";
import Card from "@mui/material/Card";
import Logo from "./Logo";
import useTheme from "@mui/material/styles/useTheme";
import { SearchInput } from "./SearchInput";
import SearchResults from "./SearchResults";

export default function SearchComponent() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        marginTop: 20,
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
        <Box sx={{ ...alignCenter }}>
          <Logo
            sx={{
              marginRight: 2,
              [theme.breakpoints.down("sm")]: { display: "none" },
            }}
          />
          <SearchInput sx={{ flex: 1 }} />
        </Box>
      </Card>

      <Card sx={{ marginTop: 4 }}>
        <SearchResults />
      </Card>
    </Box>
  );
}
