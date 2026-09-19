export async function saveEditedDocument({ currentTitle, nextTitle, content, tags, category }, {
  rename,
  update,
  onRenamed,
}) {
  if (nextTitle !== currentTitle) {
    await rename(currentTitle, nextTitle);
    onRenamed(nextTitle);
  }
  await update(nextTitle, content, tags, category);
}
