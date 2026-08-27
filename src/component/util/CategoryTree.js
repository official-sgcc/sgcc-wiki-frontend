export function flattenCategories(
  nodes,
  depth = 0,
  parentPath = [],
) {
  let result = [];

  nodes.forEach((node) => {
    const currentPath = [
      ...parentPath,
      node.name,
    ];

    const hasChildren =
      Array.isArray(node.children) &&
      node.children.length > 0;

    // 자식이 없으면 최상위든 하위든 leaf
    const isLeaf = !hasChildren;

    result.push({
      name: node.name,
      depth,
      isLeaf,
      path: currentPath,
    });

    if (hasChildren) {
      result.push(
        ...flattenCategories(
          node.children,
          depth + 1,
          currentPath,
        ),
      );
    }
  });

  return result;
}
