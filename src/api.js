// Simulate a paginated API with defer logic
export async function fetchList(page = 1, limit = 10) {
  const start = (page - 1) * limit;
  const items = Array.from({ length: limit }, (_, i) => {
    const id = start + i + 1;
    return {
      id,
      title: `Item ${id}`,
      contents: Math.random() > 0.5 ? [`Content of ${id}`] : [],
      defer: Math.random() > 0.1, // Simulate defer: true
    };
  });

  return new Promise((resolve) => setTimeout(() => resolve({ items }), 500));
}

export async function fetchContentById(id) {
  return new Promise((resolve) =>
    setTimeout(() => {
      const hasContent = Math.random() > 0.9;
      resolve({
        contents: hasContent ? [`Deferred Content for ${id}`] : [],
      });
    }, 1000)
  );
}
