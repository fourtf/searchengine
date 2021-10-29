import { Dialog } from "@mui/material";
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
      {data.map((x) => <ItemComponent key={getItemKey(x)} {...x} />)}
    </Dialog>
  );
}
