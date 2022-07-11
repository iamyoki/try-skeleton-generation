type ValueOf<T> = T[keyof T];
type Writeable<T> = {
  -readonly [P in keyof T]: T[P];
};

const TYPES = {
  PURE_BLOCK: 'pure_block',
  COLOR_BLOCK: 'color_block',
  TEXT: 'text'
} as const;

const SHAPES = {
  RECT: 'rect',
  CIRCLE: 'circle'
} as const;

type Type = ValueOf<typeof TYPES>;
type Shape = ValueOf<typeof SHAPES>;

export class SkeletonItem {
  type: Type;
  top: number;
  left: number;
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: string = 'rgba(0,0,0,0.08)';
  rootElement: HTMLElement;
  targetNode: HTMLElement | Text;
  renderElement: HTMLElement;

  constructor({
    rootElement,
    targetNode
  }: {
    rootElement: HTMLElement;
    targetNode: HTMLElement | Text;
  }) {
    this.rootElement = rootElement;
    this.targetNode = targetNode;

    const rootRect = rootElement.getBoundingClientRect();
    let targetRect;

    if (targetNode instanceof Text) {
      this.type = 'text';
      const parentElement = targetNode.parentElement!;
      targetRect = this.getContentBoundingClientRect(parentElement);
    } else {
      const {backgroundColor} = getComputedStyle(targetNode);
      const hasBgColor = backgroundColor !== 'rgba(0, 0, 0, 0)';
      this.type = hasBgColor ? 'color_block' : 'pure_block';
      this.bgColor = hasBgColor ? backgroundColor : 'rgba(0,0,0,0.04)';
      targetRect = targetNode.getBoundingClientRect();
    }

    this.top = targetRect.top - rootRect.top;
    this.left = targetRect.left - rootRect.left;
    this.x = targetRect.x - rootRect.x;
    this.y = targetRect.y - rootRect.y;
    this.width = targetRect.width;
    this.height = targetRect.height;

    const renderElement = document.createElement('div');
    renderElement.dataset['skeletonItem'] = '';
    renderElement.style.position = 'absolute';
    renderElement.style.top = `${this.top}px`;
    renderElement.style.left = `${this.left}px`;
    renderElement.style.width = `${this.width}px`;
    renderElement.style.height = `${this.height}px`;
    renderElement.style.backgroundColor = this.bgColor;
    renderElement.style.borderRadius = '8px';

    this.renderElement = renderElement;
  }

  private getContentBoundingClientRect(element: HTMLElement) {
    let rect = element.getBoundingClientRect().toJSON() as Omit<
      Writeable<DOMRect>,
      'toJSON'
    >;

    const [
      paddingTop,
      paddingRight = paddingTop,
      paddingBottom = paddingTop,
      paddingLeft = paddingRight
    ] = getComputedStyle(element)
      .padding.split(' ')
      .map(item => +item.replace('px', '')) as number[];

    rect.width = rect.width - paddingLeft - paddingRight;
    rect.left = rect.left + paddingLeft;
    rect.x = rect.x + paddingLeft;
    rect.right = rect.right - paddingRight;

    rect.height = rect.height - paddingTop - paddingBottom;
    rect.top = rect.top + paddingTop;
    rect.y = rect.y + paddingTop;
    rect.bottom = rect.bottom - paddingBottom;

    return rect;
  }
}

export class Skeleton {
  rootElement: HTMLElement;
  items: SkeletonItem[] = [];
  renderRoot?: HTMLElement;
  skeletonRoot = document.createElement('div');

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    this.skeletonRoot.dataset['skeletonRoot'] = '';
    this.skeletonRoot.style.position = 'relative';

    this.analyze();
  }

  append(...items: SkeletonItem[]) {
    this.items.push(...items);
  }

  render(containerElement?: HTMLElement) {
    (containerElement ?? document.body).appendChild(this.skeletonRoot);

    this.items.forEach(item => {
      this.skeletonRoot.appendChild(item.renderElement);
    });
  }

  private analyze() {
    // wrap text node with span tag
    this.traverseTextNodes(node => {
      // if (
      //   (node.nextElementSibling || node.previousElementSibling) &&
      //   node.textContent?.trim()
      // ) {
      // }
      const span = document.createElement('span');
      node.replaceWith(span);
      span.appendChild(node);
    });

    // collect block items
    this.traverseBlockNodes(node => {
      const item = new SkeletonItem({
        rootElement: this.rootElement,
        targetNode: node
      });
      this.items.push(item);
    });

    // collect text items
    this.traverseTextNodes(node => {
      const item = new SkeletonItem({
        rootElement: this.rootElement,
        targetNode: node
      });
      this.items.push(item);
    });
  }

  private traverseBlockNodes(use: (node: HTMLElement) => void) {
    const treeWalker = document.createTreeWalker(
      this.rootElement,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: node => {
          if (node instanceof HTMLElement) {
            const {backgroundColor, backgroundImage, borderColor} =
              getComputedStyle(node);
            const hasBgColor = backgroundColor !== 'rgba(0, 0, 0, 0)';
            const hasBgImage = backgroundImage !== 'none';
            const hasBorderColor =
              borderColor !== 'rgb(0, 0, 0)' &&
              borderColor !== 'rgba(0, 0, 0, 0)';
            const isImg = node.tagName === 'IMG';

            if (hasBgColor || hasBgImage || hasBorderColor || isImg)
              return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );
    this.walking(treeWalker, use as (node: Node) => void);
  }

  private traverseTextNodes(use: (node: Text) => void) {
    const treeWalker = document.createTreeWalker(
      document.getElementById('root')!,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: node => {
          if (/\S/.test(node.nodeValue!) === false)
            return NodeFilter.FILTER_SKIP;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    this.walking(treeWalker, use as (node: Node) => void);
  }

  private walking(treeWalker: TreeWalker, use: (node: Node) => void) {
    let currentNode: Node | null = treeWalker.currentNode;
    let firstNode = true;
    while (currentNode) {
      if (!firstNode) use(currentNode);
      firstNode = false;
      currentNode = treeWalker.nextNode();
    }
  }
}
