import { FixedSizeList as List } from "react-window";
import { useEffect, useRef, useState, useCallback } from "react";
import { fetchList } from "./api";
import { ListItem } from "./ListItem";

export function VirtualizedList() {
  const itemsRef = useRef([]); // ✅ Holds mutable items
  const [page, setPage] = useState(1);
  const [, forceUpdate] = useState(0); // ✅ Used to trigger shallow re-render

  const loadMore = useCallback(async () => {
    const res = await fetchList(page);
    itemsRef.current = [...itemsRef.current, ...res.items];
    setPage((p) => p + 1);
    forceUpdate((x) => x + 1); // Rerender list container
  }, [page]);

  useEffect(() => {
    loadMore(); // initial fetch
  }, []);

  const handleRemove = useCallback((id) => {
    const index = itemsRef.current.findIndex((item) => item.id === id);
    if (index !== -1) {
      itemsRef.current.splice(index, 1); // ⚠️ Mutate directly
      forceUpdate((x) => x + 1);
    }
  }, []);

  const Row = useCallback(
    ({ index, style }) => {
      const item = itemsRef.current[index];
      if (!item) return null;

      return (
        <div style={style}>
          <ListItem data={item} onRemove={handleRemove} />
        </div>
      );
    },
    [handleRemove]
  );

  const handleScroll = useCallback(
    ({ scrollOffset, scrollDirection }) => {
      if (itemsRef.current.length === 0 || scrollDirection !== "forward")
        return;

      const visibleIndex = Math.floor(scrollOffset / 60); // assuming itemSize = 60
      const remaining = itemsRef.current.length - visibleIndex;

      if (remaining <= 3) {
        loadMore();
      }
    },
    [loadMore]
  );

  return (
    <List
      height={600}
      itemCount={itemsRef.current.length}
      itemSize={60}
      width={"100%"}
      itemKey={(index) => itemsRef.current[index].id}
      onScroll={handleScroll}
    >
      {Row}
    </List>
  );
}
