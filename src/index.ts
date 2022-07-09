import {CloneElement} from './CloneElement.class';
import {getContentBoundingClientRect} from './getContentBoundingClientRect';
import {getElementTextWidth} from './getElementTextWidth';
import {getLineHeight} from './getLineHeight';
import {traverseNodes} from './traverseNodes';

const root = document.getElementById('root');
const skeleton = document.createElement('div');
skeleton.id = 'skeleton';
skeleton.style.pointerEvents = 'none';
root?.after(skeleton);

// 预处理
traverseNodes(root!, node => {
  if (
    node.nextElementSibling ||
    (node.previousElementSibling && node.nodeType === Node.TEXT_NODE)
  ) {
    const span = document.createElement('span');
    node.replaceWith(span);
    span.appendChild(node);
  }
});

// 处理多行文字
traverseNodes(root!, node => {
  if (node.nodeType === Node.TEXT_NODE && /\S/.test(node.nodeValue!)) {
    const parentElement = node.parentElement!;
    const {top, left, width, height} =
      getContentBoundingClientRect(parentElement);
    const {lineHeight, fontSize} = getComputedStyle(parentElement);

    const numberedFontSize = +fontSize.replace('px', '');
    const numberedLineHeight = getLineHeight(parentElement);

    const isSingleline = height < numberedFontSize * 2;
    const isMultiline = !isSingleline;

    if (isSingleline) {
      const paddingY = (height - numberedFontSize) / 2;
      const textWidth = getElementTextWidth(parentElement);
      const skeletonItem = document.createElement('div');
      skeleton.appendChild(skeletonItem);

      skeletonItem.className = 'skeleton-item';
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

      // console.log({
      //   text: node.textContent,
      //   textWidth,
      //   lineCount
      // })

      Array.from({length: lineCount}, (_, n) => n).forEach(n => {
        const isLastLine = n === lineCount - 1;
        const lineTop = top + (height / lineCount) * n;
        const skeletonItem = document.createElement('div');
        skeleton.appendChild(skeletonItem);

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

    console.log({
      lineHeight,
      numberedLineHeight,
      fontSize,
      height,
      isMultiline,
      width,
      text: node.textContent,
      parentElement
    });
  }
});

traverseNodes(root!, node => {
  try {
    node.style.color = 'transparent';
  } catch {}
});
