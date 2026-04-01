import { useMemo, useState } from "react";

export type RateKey = "roomOnly" | "breakfast";

export function useInventoryManager(totalInventory: number) {
  const [selectedRooms, setSelectedRooms] = useState<Record<RateKey, number>>({
    roomOnly: 0,
    breakfast: 0,
  });

  const selectedTotal = useMemo(
    () => selectedRooms.roomOnly + selectedRooms.breakfast,
    [selectedRooms],
  );

  const remainingInventory = useMemo(
    () => Math.max(0, totalInventory - selectedTotal),
    [totalInventory, selectedTotal],
  );

  const setQuantity = (key: RateKey, nextQty: number) => {
    setSelectedRooms((prev) => {
      const next = Math.max(0, Math.floor(nextQty));
      const otherKey: RateKey = key === "roomOnly" ? "breakfast" : "roomOnly";
      const other = prev[otherKey];
      const maxForThis = totalInventory - other;
      return {
        ...prev,
        [key]: Math.min(next, Math.max(0, maxForThis)),
      };
    });
  };

  const maxSelectableFor = (key: RateKey) => {
    const otherKey: RateKey = key === "roomOnly" ? "breakfast" : "roomOnly";
    return Math.max(0, totalInventory - selectedRooms[otherKey]);
  };

  return {
    totalInventory,
    selectedRooms,
    selectedTotal,
    remainingInventory,
    setQuantity,
    maxSelectableFor,
  };
}
