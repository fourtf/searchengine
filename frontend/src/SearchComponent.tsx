import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import EastIcon from "@mui/icons-material/East";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { alignCenter, justifyCenter } from "./util";
import Card from "@mui/material/Card";
import Autocomplete, {
  AutocompleteRenderInputParams,
} from "@mui/material/Autocomplete";
import React from "react";
import Logo from "./Logo";
import IconButton from "@mui/material/IconButton";
import useTheme from "@mui/material/styles/useTheme";

// export default class SearchComponent extends Component<any, any> {
//   render() {
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
    </Box>
  );
}
//   }
// }

const autocompletePlaceholder = ["aab", "ac", "aaaab", "aaaac", "aaaad"];

function getAutocompleteOptions(value: string) {
  value = value.toLowerCase().trim();

  return autocompletePlaceholder.filter((placeholder) =>
    placeholder.indexOf(value) !== -1
  );
}

function SearchInput(props: any) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const loading = open && options.length === 0;
  const [content, setContent] = useState("");

  useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    (async () => {
      await sleep(1e3); // For demo purposes.

      if (active) {
        setOptions(getAutocompleteOptions(""));
      }
    })();

    return () => {
      active = false;
    };
  }, [loading]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  const render = (params: AutocompleteRenderInputParams) => (
    <TextField
      {...params}
      InputProps={{
        ...params.InputProps,
        sx: { paddingRight: "9px !important" },
        startAdornment: <SearchIcon sx={{ marginLeft: 1, marginRight: 1 }} />,
        endAdornment: (
          <React.Fragment>
            <IconButton sx={{ opacity: content.length > 0 ? 1 : 0 }}>
              <EastIcon />
            </IconButton>
          </React.Fragment>
        ),
        autoFocus: true,
      }}
      value={content}
      onChange={(
        e,
      ) => setContent(e.target.value)}
    />
  );

  return (
    <Autocomplete
      {...props}
      id="asynchronous-demo"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, value) => option === value}
      getOptionLabel={(option) => option}
      options={options}
      loading={loading}
      renderInput={render}
      freeSolo={true}
    />
  );
}

function sleep(delay = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}
