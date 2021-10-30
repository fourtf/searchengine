import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import EastIcon from "@mui/icons-material/East";
import { useEffect, useState } from "react";
import Autocomplete, {
  AutocompleteRenderInputParams,
} from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";
import { typing as apiTyping } from "../api";
import { isSearchingState, performSearch } from "../search";
import { useHookstate } from "@hookstate/core";
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Checkbox, FormControlLabel, useTheme } from "@mui/material";
import Logo from "./Logo";
import { alignCenter } from "../util";

export function SearchInput(props: any) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const isSearching = useHookstate(isSearchingState);
  const [allowExplicit, setAllowExplicit] = useState(true);
  const [year, setYear] = useState<string>("");

  useEffect(() => {
    (async () => {
      setOptions(await getAutocompleteOptions(query));
    })();
  }, [query]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <>
      <Box sx={{ ...alignCenter }}>
        <Logo
          sx={{
            marginRight: 2,
            [theme.breakpoints.down("sm")]: { display: "none" },
          }}
        />
        <Box sx={{ width: "100%" }}>
          <Autocomplete
            {...props}
            id="asynchronous-demo"
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            isOptionEqualToValue={(option, value) => option === value}
            getOptionLabel={(option) => option}
            options={options}
            renderInput={Input}
            freeSolo={true}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 1,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={allowExplicit}
              onChange={(_, v) => setAllowExplicit(v)}
            />
          }
          label="Explicit Songs"
          sx={{ marginTop: 1 }}
        />
        <TextField
          label="Year"
          placeholder="e.g. 2020"
          size="small"
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          sx={{
            marginLeft: 2,
            marginTop: "10px",
            width: "100px",
          }}
        />
      </Box>
    </>
  );

  function go() {
    performSearch({ query, allowExplicit, year });
  }

  function Input(params: AutocompleteRenderInputParams) {
    return (
      <TextField
        {...params}
        InputProps={{
          ...params.InputProps,
          sx: { paddingRight: "9px !important" },
          startAdornment: <SearchIcon sx={{ marginLeft: 1, marginRight: 1 }} />,
          endAdornment: <GoButton />,
          autoFocus: true,
        }}
        value={query}
        onChange={(
          e,
        ) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            go();
          }
        }}
      />
    );
  }

  function GoButton() {
    return (
      <IconButton
        sx={{ opacity: query.length > 0 ? 1 : 0 }}
        onClick={go}
      >
        {isSearching.get() ? <CircularProgress size={24} /> : <EastIcon />}
      </IconButton>
    );
  }
}

async function getAutocompleteOptions(value: string): Promise<string[]> {
  try {
    return await apiTyping(value);
  } catch (e) {
    console.error(e);
    return [];
  }
}
