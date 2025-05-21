import { useEffect, useState, memo } from "react";
import { fetchContentById } from "./api";

export function ListItemComponent({ data, onRemove }) {
  const [content, setContent] = useState(data.contents);
  const [loading, setLoading] = useState(data.defer && content.length === 0);

  useEffect(() => {
    let cancelled = false;

    window.onRemove = onRemove;

    async function loadDeferredContent() {
      if (data.defer && content.length === 0) {
        setLoading(true);
        const res = await fetchContentById(data.id);
        if (!cancelled) {
          if (res.contents.length === 0) {
            onRemove(data.id); // Tell parent to remove
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
  }, [data]);

  return (
    <div style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
      <strong>{data.title}</strong>
      <div>{loading ? "Loading..." : content.join(", ")}</div>
    </div>
  );
}

export const ListItem = memo(ListItemComponent, () => true);
