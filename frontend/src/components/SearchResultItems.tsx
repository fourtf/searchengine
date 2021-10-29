import { Box, Button, Card, Typography } from "@mui/material";
import { useTheme } from "@mui/system";
import { ComponentType, useState } from "react";
import { SearchResultMoreDialog } from "./SearchResultMoreDialog";
import { ExpandMore } from "@mui/icons-material";

export function SearchResultItems<T>(
  {
    title,
    items,
    isColumn,
    ItemComponent,
    getItemKey,
  }: {
    items: T[];
    title: string;
    isColumn: boolean;
    ItemComponent: ComponentType<T>;
    getItemKey: (item: T) => string;
  },
) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Category title={title}>
        <Box
          sx={{
            display: "flex",

            ...(isColumn
              ? {
                flexDirection: "column",
                "> *": { marginTop: 2 },
              }
              : {
                justifyContent: "space-around",
                flexWrap: "wrap",
              }),
          }}
        >
          {items.slice(0, isColumn ? 5 : 4).map((x) => (
            <ItemComponent
              key={getItemKey(x)}
              {...x}
            />
          ))}
        </Box>

        <MoreButton sx={{ marginTop: 2 }} onClick={() => setOpen(true)} />

        <SearchResultMoreDialog
          items={items}
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          ItemComponent={ItemComponent}
          getItemKey={getItemKey}
        />
      </Category>
    </>
  );
}

function Category(
  { title, children, ...props }: {
    title: string;
    children: any;
    [x: string]: any;
  },
) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        marginTop: 2,
        padding: 2,
        marginLeft: 4,
        marginRight: 4,
        [theme.breakpoints.down("sm")]: {
          marginLeft: 0,
          marginRight: 0,
        },
      }}
    >
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        {title}
      </Typography>

      <Box {...props}>
        {children}
      </Box>
    </Card>
  );
}

export function MoreButton(
  { onClick, ...props }: { onClick: () => void; sx: any } & {
    [key: string]: unknown;
  },
) {
  return (
    <Box
      {...props}
      sx={{ ...props.sx, display: "flex", justifyContent: "center" }}
    >
      <Button onClick={onClick}>
        <ExpandMore />
      </Button>
    </Box>
  );
}
