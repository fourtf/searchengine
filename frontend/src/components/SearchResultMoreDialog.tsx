import { Box, Dialog } from "@mui/material";
import { ComponentType, useState } from "react";

export function SearchResultMoreDialog<T>(
  {
    items,
    open,
    isColumn,
    onClose,
    ItemComponent,
    getItemKey,
  }: {
    items: T[];
    open: boolean;
    isColumn: boolean;
    onClose: () => void;

    ItemComponent: ComponentType<T>;
    getItemKey: (item: T) => string;
  },
) {
  const [data] = useState<T[]>(items);

  return (
    <Dialog open={open} onClose={onClose} fullWidth={true}>
      <Box
        sx={{
          margin: 2,
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
        {data.map((x) => (
          <Box
            key={getItemKey(x)}
            sx={{ marginTop: 2, marginLeft: 1, marginRight: 1 }}
          >
            <ItemComponent {...x} />
          </Box>
        ))}
      </Box>
    </Dialog>
  );
}
