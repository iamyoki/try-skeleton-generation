import {getContentBoundingClientRect} from './getContentBoundingClientRect';
import {getLineHeight} from './getLineHeight';
import {getElementTextWidth} from './getElementTextWidth';
import {traverseNodes} from './traverseNodes';

export {};

const blockTreeWalker = document.createTreeWalker(
  document.getElementById('root')!,
  NodeFilter.SHOW_ELEMENT,
  {
    acceptNode: node => {
      if (node instanceof HTMLElement) {
        const {backgroundColor, backgroundImage, borderColor} =
          getComputedStyle(node);
        const hasBgColor = backgroundColor !== 'rgba(0, 0, 0, 0)';
        const hasBgImage = backgroundImage !== 'none';
        const hasBorderColor =
          borderColor !== 'rgb(0, 0, 0)' && borderColor !== 'rgba(0, 0, 0, 0)';
        const isImg = node.tagName === 'IMG';

        if (hasBgColor || hasBgImage || hasBorderColor || isImg)
          return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_SKIP;
    }
  }
);

const textTreeWalker = document.createTreeWalker(
  document.getElementById('root')!,
  NodeFilter.SHOW_TEXT,
  {
    acceptNode: node => {
      if (/\S/.test(node.nodeValue!) === false) return NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    }
  }
);

const skeletonRoot = document.createElement('div');
skeletonRoot.id = 'skeleton-root';
skeletonRoot.style.position = 'relative';
document.body.appendChild(skeletonRoot);

function walking(treeWalker: TreeWalker, use: (node: Node) => void) {
  let currentNode: Node | null = treeWalker.currentNode;
  let firstNode = true;
  while (currentNode) {
    if (!firstNode) use(currentNode);
    firstNode = false;
    currentNode = treeWalker.nextNode();
  }
}

// 预处理
// traverseNodes(document.getElementById('root')!, node => {
//   if (
//     (node.nextElementSibling || node.previousElementSibling) &&
//     node.nodeType === Node.TEXT_NODE &&
//     node.textContent?.trim()
//   ) {
//     const span = document.createElement('span');
//     node.replaceWith(span);
//     span.appendChild(node);
//   }
// });
// walking(textTreeWalker, node => {
//   if (node instanceof Text) {
//     if (
//       (node.nextElementSibling || node.previousElementSibling) &&
//       node.nodeType === Node.TEXT_NODE &&
//       node.textContent?.trim()
//     ) {
//       const span = document.createElement('span');
//       node.replaceWith(span);
//       span.appendChild(node);
//     }
//   }
// });

walking(blockTreeWalker, node => {
  const el = node as HTMLElement;
  const {backgroundColor, backgroundImage, borderColor} = getComputedStyle(el);
  const hasBgColor = backgroundColor !== 'rgba(0, 0, 0, 0)';
  const hasBgImage = backgroundImage !== 'none';
  const hasBorderColor =
    borderColor !== 'rgb(0, 0, 0)' && borderColor !== 'rgba(0, 0, 0, 0)';

  const {top, left, width, height} = el.getBoundingClientRect();
  const color = 'rgba(0,0,0,.04)';

  const skeletonItem = document.createElement('div');
  skeletonItem.classList.add('skeleton-item', 'skeleton-item__block');
  skeletonRoot.appendChild(skeletonItem);

  skeletonItem.style.position = 'absolute';
  skeletonItem.style.borderRadius = '8px';
  skeletonItem.style.top = `${top}px`;
  skeletonItem.style.left = `${left}px`;
  skeletonItem.style.width = `${width}px`;
  skeletonItem.style.height = `${height}px`;
  skeletonItem.style.backgroundColor = color;

  if (hasBgColor) {
    skeletonItem.style.backgroundColor = backgroundColor;
    skeletonItem.style.filter = 'opacity(.2) saturate(.4) contrast(1.5)';
  }
});

walking(textTreeWalker, node => {
  const parentElement = node.parentElement!;
  const {top, left, width, height} =
    getContentBoundingClientRect(parentElement);
  const {fontSize} = getComputedStyle(parentElement);

  const numberedFontSize = +fontSize.replace('px', '');
  const numberedLineHeight = getLineHeight(parentElement);

  const isSingleline = height < numberedFontSize * 2;
  const isMultiline = !isSingleline;

  console.log({top,left, isSingleline})

  if (isSingleline) {
    const paddingY = (height - numberedFontSize) / 2;
    const textWidth = getElementTextWidth(parentElement);
    const skeletonItem = document.createElement('div');
    skeletonRoot.appendChild(skeletonItem);

    skeletonItem.classList.add('skeleton-item', 'skeleton-item__text');
    skeletonItem.style.position = 'absolute';
    skeletonItem.style.top = `${top + paddingY}px`;
    skeletonItem.style.left = `${left}px`;
    skeletonItem.style.width = `${textWidth}px`;
    skeletonItem.style.height = `${numberedFontSize}px`;
    skeletonItem.style.backgroundColor = `rgba(0,0,0,.08)`;
    skeletonItem.style.borderRadius = '8px';
  }

  if (isMultiline) {
    const lineCount = Math.floor(
      height / numberedLineHeight / numberedFontSize
    );
    const linePaddingY = numberedFontSize * (numberedLineHeight - 1);
    const textWidth = getElementTextWidth(parentElement);
    const lastLineWidth = Math.min(lineCount * width - textWidth, width);

    Array.from({length: lineCount}, (_, n) => n).forEach(n => {
      const isLastLine = n === lineCount - 1;
      const lineTop = top + (height / lineCount) * n;
      const skeletonItem = document.createElement('div');
      skeletonRoot.appendChild(skeletonItem);

      skeletonItem.className = 'skeleton-item';
      skeletonItem.style.position = 'absolute';
      skeletonItem.style.top = `${lineTop + linePaddingY}px`;
      skeletonItem.style.left = `${left}px`;
      skeletonItem.style.width = `${isLastLine ? lastLineWidth : width}px`;
      skeletonItem.style.height = `${numberedFontSize}px`;
      skeletonItem.style.backgroundColor = `rgba(0,0,0,.08)`;
      skeletonItem.style.borderRadius = '8px';
    });
  }
});
