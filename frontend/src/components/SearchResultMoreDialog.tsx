import { Box, Dialog } from "@mui/material";
import { ComponentType, useState } from "react";

export function SearchResultMoreDialog<T>(
  { items, open, onClose, ItemComponent, getItemKey }: {
    items: T[];
    open: boolean;
    onClose: () => void;

    ItemComponent: ComponentType<T>;
    getItemKey: (item: T) => string;
  },
) {
  const [data] = useState<T[]>(items);

  return (
    <Dialog open={open} onClose={onClose}>
      <Box sx={{ margin: 4 }}>
        {data.map((x) => (
          <Box sx={{ marginTop: 2 }}>
            <ItemComponent key={getItemKey(x)} {...x} />
          </Box>
        ))}
      </Box>
    </Dialog>
  );
}
