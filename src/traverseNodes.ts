export function traverseNodes(
  nodes: HTMLElement[] | HTMLElement,
  eachNodeCallback: (element: HTMLElement & ChildNode) => void
) {
  const secureNodes = [nodes].flat();

  function traverse(next: typeof secureNodes) {
    next.forEach(item => {
      eachNodeCallback(item);
      if (item.childNodes.length)
        traverse(Array.from(item.childNodes) as HTMLElement[]);
    });
  }

  traverse(secureNodes);
}
