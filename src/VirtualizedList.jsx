import { FixedSizeList as List } from "react-window";
import { useEffect, useState, useCallback } from "react";
import { fetchList } from "./api";
import { ListItem } from "./ListItem";
import { useContext } from "react";
import React from "react";

const VMemoizeStateContext = React.createContext([]);
const VMemoizeUpdaterContext = React.createContext(undefined);

export function VirtualizedList() {
  const [items, setItems] = useState([]);
  const itemCountRef = React.useRef(0);
  const pageRef = React.useRef(0);
  const listRef = React.useRef(null);
  const visitedRangeRef = React.useRef(null);
  const loadingRef = React.useRef(false);

  const loadMore = async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;

    try {
      pageRef.current = pageRef.current + 1;
      const res = await fetchList(pageRef.current, 50);
      setItems((prev) => {
        const newItems = [...prev, ...res.items];
        itemCountRef.current = newItems.length;
        return newItems;
      });
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    loadMore();
  }, []);

  const handleRemove = (id) => {
    setItems((prev) => {
      const newItems = prev.filter((item) => item.id !== id);
      itemCountRef.current = newItems.length;
      return newItems;
    });
  };

  useEffect(() => {
    const list = listRef.current;

    console.log(list);

    if (!list || !list._getRangeToRender) {
      console.error(
        "List is not initialized or _getRangeToRender is not found"
      );
      return;
    }

    const originalGetRangeToRender = list._getRangeToRender;

    list._getRangeToRender = function () {
      const [start, stop, ...rest] = originalGetRangeToRender.apply(
        this,
        arguments
      );

      if (visitedRangeRef.current === null) {
        visitedRangeRef.current = { min: start, max: stop };
      } else {
        visitedRangeRef.current.min = Math.min(
          visitedRangeRef.current.min,
          start
        );
        visitedRangeRef.current.max = Math.max(
          visitedRangeRef.current.max,
          stop
        );
      }

      const min = Math.max(0, visitedRangeRef.current.min);
      const max = Math.min(
        itemCountRef.current - 1,
        visitedRangeRef.current.max
      );

      console.log({
        min,
        max,
      });

      return [min, max, ...rest];
    };
  }, [!!items.length]);

  if (!items.length) {
    return <div>Loading...</div>;
  }

  return (
    <List
      ref={listRef}
      height={600}
      itemCount={items.length}
      overscanCount={2}
      itemSize={60}
      width={"100%"}
      onItemsRendered={({ visibleStopIndex }) => {
        const remainingItems = items.length - visibleStopIndex - 1;
        console.log({ remainingItems });
        if (remainingItems <= 1) {
          console.log("load more");
          loadMore();
        }
      }}
      itemKey={(index) => {
        return items[index].id;
      }}
      itemData={{ items, handleRemove }}
      initialScrollOffset={800}
    >
      {RowPure}
    </List>
  );
}

const RowPure = ({ index, style, data }) => {
  const { items, handleRemove } = data;

  return (
    <div style={style}>
      <ListItem data={items[index]} onRemove={handleRemove} />
    </div>
  );
};
