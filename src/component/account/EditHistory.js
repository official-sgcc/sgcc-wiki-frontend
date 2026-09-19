export function getEditList(data) {
  const versions = data?.edit_versions ?? data?.editList ?? [];
  const events = data?.edit_events ?? [];
  return [...versions, ...events].sort((a, b) =>
    new Date(b.updated_at ?? 0) - new Date(a.updated_at ?? 0));
}
