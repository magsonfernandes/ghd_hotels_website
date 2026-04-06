import { useMemo, useState } from "react";

export function useRoomQuantity(totalInventory: number) {
  const [quantity, setQuantityState] = useState(0);
  const remainingInventory = useMemo(
    () => Math.max(0, totalInventory - quantity),
    [totalInventory, quantity],
  );
  const setQuantity = (n: number) => {
    const next = Math.max(0, Math.min(totalInventory, Math.floor(n)));
    setQuantityState(next);
  };
  return { quantity, remainingInventory, setQuantity, totalInventory };
}
