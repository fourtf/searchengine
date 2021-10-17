import "./App.css";
import SearchComponent from "./SearchComponent";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/system/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { justifyCenter } from "./util";
import Link from "@mui/material/Link";

// const theme = createTheme({});

const theme = createTheme({
  palette: {
    // mode: "dark",
    primary: {
      light: "#757ce8",
      main: "#3f50b5",
      dark: "#002884",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ff7961",
      main: "#f44336",
      dark: "#ba000d",
      contrastText: "#000",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "100vh",
        }}
      >
        <Container maxWidth="md">
          <SearchComponent />
        </Container>

        <Container maxWidth="md" sx={{ ...justifyCenter, marginBottom: 1 }}>
          <Link href="https://www.svgbackgrounds.com/" target="_blank">
            background
          </Link>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
