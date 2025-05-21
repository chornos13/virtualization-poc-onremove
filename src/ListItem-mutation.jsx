import { useEffect, useState } from "react";
import { fetchContentById } from "./api";
import React from "react";

function ListItemComponent({ data, onRemove }) {
  const [content, setContent] = useState(data.contents);
  const [loading, setLoading] = useState(data.defer && content.length === 0);

  useEffect(() => {
    let cancelled = false;
    window.onRemove = onRemove;

    async function loadDeferredContent() {
      console.log(data.defer, "dataid", data.id);
      if (data.defer && content.length === 0) {
        setLoading(true);
        const res = await fetchContentById(data.id);
        if (!cancelled) {
          if (res.contents.length === 0) {
            onRemove(data.id); // tell parent to remove
          } else {
            setContent(res.contents);
          }
          setLoading(false);
        }
      }
    }

    loadDeferredContent();
    return () => {
      cancelled = true;
    };
  }, [data, onRemove]);

  return (
    <div style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
      <strong>{data.title}</strong>
      <div>{loading ? "Loading..." : content.join(", ")}</div>
    </div>
  );
}

// Prevent re-renders if props don't change
export const ListItem = React.memo(ListItemComponent);
