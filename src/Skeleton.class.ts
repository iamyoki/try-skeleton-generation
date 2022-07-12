import {desaturate, rgba, setLightness} from 'polished';
import {CloneElement} from './CloneElement.class';

type Writeable<T> = {
  -readonly [P in keyof T]: T[P];
};

export class SkeletonItem {
  top: number;
  left: number;
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: string = 'rgba(0,0,0,0.08)';
  renderElement?: HTMLElement;

  constructor({
    top,
    left,
    x,
    y,
    width,
    height,
    bgColor
  }: {
    top: number;
    left: number;
    x: number;
    y: number;
    width: number;
    height: number;
    bgColor?: string;
  }) {
    this.top = top;
    this.left = left;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    if (bgColor) this.bgColor = bgColor;
  }

  render() {
    const renderElement = document.createElement('div');
    renderElement.dataset['skeletonItem'] = '';
    renderElement.style.position = 'absolute';
    renderElement.style.top = `${this.top}px`;
    renderElement.style.left = `${this.left}px`;
    renderElement.style.width = `${this.width}px`;
    renderElement.style.height = `${this.height}px`;
    renderElement.style.backgroundColor = this.bgColor;
    renderElement.style.borderRadius = '4px';

    this.renderElement = renderElement;
    return this.renderElement;
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
    // this.skeletonRoot.style.pointerEvents = 'none';
    this.skeletonRoot.style.animation = 'skeleton .6s infinite alternate';

    document.styleSheets[0].insertRule(`
      @keyframes skeleton {
        from {
          opacity: 0.5
        }
        to {
          opacity: 1
        }
      }
    `);

    this.analyze();
  }

  render(containerElement?: HTMLElement) {
    (containerElement ?? document.body).appendChild(this.skeletonRoot);

    this.items.forEach(item => {
      const renderElement = item.render();
      this.skeletonRoot.appendChild(renderElement);
    });
  }

  private analyze() {
    // wrap text node with span tag
    this.traverseTextNodes(node => {
      if (
        (node.nextElementSibling || node.previousElementSibling) &&
        node.textContent?.trim()
      ) {
        const span = document.createElement('span');
        node.replaceWith(span);
        span.appendChild(node);
      }
    });

    // collect block items
    this.traverseBlockNodes(node => {
      const {backgroundColor} = getComputedStyle(node);
      const hasBgColor = backgroundColor !== 'rgba(0, 0, 0, 0)';
      const isImg = node.tagName === 'IMG';
      const rootRect = this.rootElement.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();

      const item = new SkeletonItem({
        top: nodeRect.top - rootRect.top,
        left: nodeRect.left - rootRect.left,
        x: nodeRect.x - rootRect.x,
        y: nodeRect.y - rootRect.y,
        width: nodeRect.width,
        height: nodeRect.height,
        bgColor: hasBgColor
          ? setLightness(.9, desaturate(0.5, rgba(backgroundColor, 0.8)))
          : isImg
          ? 'rgba(0,0,0,0.08)'
          : 'rgba(0,0,0,0.04)'
      });

      this.items.push(item);
    });

    // collect text items
    this.traverseTextNodes(node => {
      const parentElement = node.parentElement!;
      const {top, left, width, height, x, y} =
        this.getContentBoundingClientRect(parentElement);
      const {lineHeight, fontSize} = getComputedStyle(parentElement);

      const numberedFontSize = +fontSize.replace('px', '');
      const numberedLineHeight = this.getLineHeight(parentElement);

      const isSingleline = height < numberedFontSize * 2;
      const isMultiline = !isSingleline;

      if (isSingleline) {
        const paddingY = (height - numberedFontSize) / 2;
        const textWidth = this.getElementTextWidth(parentElement);

        const item = new SkeletonItem({
          top: top + paddingY,
          left,
          width: textWidth,
          height: numberedFontSize,
          x,
          y: y + paddingY,
          bgColor: 'rgba(0,0,0,.08)'
        });

        this.items.push(item);
      }

      if (isMultiline) {
        const lineCount = Math.floor(
          height / numberedLineHeight / numberedFontSize
        );
        const linePaddingY = numberedFontSize * (numberedLineHeight - 1);
        const textWidth = this.getElementTextWidth(parentElement);
        const lastLineWidth = Math.min(lineCount * width - textWidth, width);

        Array.from({length: lineCount}, (_, n) => n).forEach(n => {
          const isLastLine = n === lineCount - 1;
          const lineTop = top + (height / lineCount) * n;

          const item = new SkeletonItem({
            top: lineTop + linePaddingY,
            left,
            width: isLastLine ? lastLineWidth : width,
            height: numberedFontSize,
            x,
            y: lineTop + linePaddingY,
            bgColor: 'rgba(0,0,0,.08)'
          });

          this.items.push(item);
        });
      }
    });

    // merge items that are too close
    this.items.forEach((current, index, all) => {
      const prev = all[index - 1];
      if (!prev) return;
      if (
        current.left - (prev.left + prev.width) < 4 &&
        current.top === prev.top
      ) {
        current.left = prev.left;
        current.width = current.width + (current.left - prev.left + prev.width);
        prev.bgColor = 'transparent';
      }
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

  private getElementTextWidth(element: HTMLElement) {
    const font = getComputedStyle(element).font;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    context.font = font;
    const {width} = context.measureText(element.textContent ?? '');
    canvas.remove();

    return width;
  }

  private getLineHeight(element: HTMLElement) {
    const {height} = element.getBoundingClientRect();

    // change element rendering
    const clone = new CloneElement(element);
    clone.replaceOriginal();

    clone.cloneElement.style.lineHeight = '1';
    const changedHeight = clone.cloneElement.getBoundingClientRect().height;

    // restore element rendering
    clone.restore();
    clone.destory();

    // calculate the original line height number
    const originalLineHeight = height / changedHeight;
    return originalLineHeight;
  }
}
