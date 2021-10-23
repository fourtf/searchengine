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

export function SearchInput(props: any) {
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
      if (active) {
        setOptions(await getAutocompleteOptions(content));
      }
    })();

    return () => {
      active = false;
    };
  }, [loading, content]);

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

async function getAutocompleteOptions(value: string): Promise<string[]> {
  return await apiTyping(value);
}
