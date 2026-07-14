export function flattenCategories(nodes, depth = 0){

  let result = [];

  nodes.forEach(node => {

    const isLeaf =
      !node.children ||
      node.children.length === 0;


    result.push({
      name: node.name,
      depth,
      isLeaf
    });


    if(node.children?.length){

      result.push(
        ...flattenCategories(
          node.children,
          depth + 1
        )
      );

    }

  });


  return result;
}