function count(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function updatedTime(document) {
  const timestamp = Date.parse(document.updated_at);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function sortDocuments(documents, order) {
  return [...documents].sort((first, second) => {
    if (order === 'likes') {
      const byLikes = count(second.like_count) - count(first.like_count);
      if (byLikes) return byLikes;
      const byViews = count(second.view_count ?? second.views) - count(first.view_count ?? first.views);
      if (byViews) return byViews;
    } else if (order === 'views') {
      const byViews = count(second.view_count ?? second.views) - count(first.view_count ?? first.views);
      if (byViews) return byViews;
    }

    const byDate = updatedTime(second) - updatedTime(first);
    if (byDate) return order === 'oldest' ? -byDate : byDate;
    return String(first.title).localeCompare(String(second.title), 'ko');
  });
}
