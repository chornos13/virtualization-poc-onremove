import { FixedSizeList as List } from "react-window";
import { useEffect, useState, useCallback } from "react";
import { fetchList } from "./api";
import { ListItem } from "./ListItem";

export function VirtualizedList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    const res = await fetchList(page);
    setItems((prev) => [...prev, ...res.items]);
    setPage((p) => p + 1);
  }, [page]);

  useEffect(() => {
    loadMore();
  }, []);

  const handleRemove = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleScroll = ({ scrollOffset, scrollDirection }) => {
    if (items.length === 0 || scrollDirection !== "forward") return;
    const nearEnd = scrollOffset > (items.length - 3) * 60;
    if (nearEnd) {
      loadMore();
    }
  };

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={60}
      width={"100%"}
      onScroll={handleScroll}
      itemKey={(index) => {
        console.log("imtekey", items[index].id);
        return items[index].id;
      }}
      itemData={{ items, handleRemove }}
    >
      {Row}
    </List>
  );
}
const Row = ({ index, style, data }) => {
  const { items, handleRemove } = data;

  return (
    <div style={style}>
      <ListItem data={items[index]} onRemove={handleRemove} />
    </div>
  );
};
