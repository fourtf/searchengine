import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import EastIcon from "@mui/icons-material/East";
import { useEffect, useState } from "react";
import Autocomplete, {
  AutocompleteRenderInputParams,
} from "@mui/material/Autocomplete";
import React from "react";
import IconButton from "@mui/material/IconButton";
import { typing as apiTyping } from "../api";
import { isSearchingState, performSearch } from "../search";
import { useHookstate } from "@hookstate/core";
import CircularProgress from "@mui/material/CircularProgress";

export function SearchInput(props: any) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const isSearching = useHookstate(isSearchingState);

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
  );

  function go() {
    performSearch({ query });
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
