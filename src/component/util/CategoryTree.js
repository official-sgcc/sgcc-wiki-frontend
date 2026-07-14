export function flattenCategories(
  nodes,
  depth = 0,
  parentPath = []
){

  let result = [];

  nodes.forEach(node => {

    const currentPath = [
      ...parentPath,
      node.name
    ];

    const hasChildren =
      node.children &&
      node.children.length > 0;

    const isLeaf =
      !hasChildren &&
      depth > 0;


    result.push({
      name: node.name,
      depth,
      isLeaf,
      path: currentPath
    });


    if(hasChildren){

      result.push(
        ...flattenCategories(
          node.children,
          depth + 1,
          currentPath
        )
      );

    }

  });


  return result;
}