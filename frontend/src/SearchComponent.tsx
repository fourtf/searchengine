import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import { Component } from "react";

export default class SearchComponent extends Component<any, any> {
  render() {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <TextField
            InputProps={{
              startAdornment: <SearchIcon />,
            }}
            focused={true}
          >
          </TextField>
          <Button variant="outlined">Search</Button>
        </div>
      </div>
    );
  }
}
