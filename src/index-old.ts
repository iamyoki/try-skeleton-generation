import {getContentBoundingClientRect} from './getContentBoundingClientRect';
import {getElementTextWidth} from './getElementTextWidth';
import {getLineHeight} from './getLineHeight';
import {traverseNodes} from './traverseNodes';

const root = document.getElementById('root')!;
const skeleton = document.createElement('div');
skeleton.id = 'skeleton';
skeleton.style.pointerEvents = 'none';
// skeleton.style.position = 'relative';
root?.after(skeleton);

// 预处理
traverseNodes(root!, node => {
  if (
    (node.nextElementSibling || node.previousElementSibling) &&
    node.nodeType === Node.TEXT_NODE &&
    node.textContent?.trim()
  ) {
    const span = document.createElement('span');
    node.replaceWith(span);
    span.appendChild(node);
  }
});

// 处理带背景的容器
traverseNodes(root!, node => {
  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const {backgroundColor, backgroundImage} = getComputedStyle(node);

  const hasBgColor = backgroundColor !== 'rgba(0, 0, 0, 0)';
  const hasBgImage = backgroundImage !== 'none';
  const isImg = node.tagName === 'IMG'

  const {top, left, width, height} = node.getBoundingClientRect();
  const skeletonItem = document.createElement('div');
  skeleton.appendChild(skeletonItem);

  skeletonItem.className = 'skeleton-item';
  skeletonItem.style.position = 'absolute';
  skeletonItem.style.top = `${top}px`;
  skeletonItem.style.left = `${left}px`;
  skeletonItem.style.width = `${width}px`;
  skeletonItem.style.height = `${height}px`;
  if (hasBgColor) {
    skeletonItem.style.backgroundColor = backgroundColor;
    skeletonItem.style.filter = 'opacity(.2) saturate(.4) contrast(1.5)';
  }
  if (hasBgImage) {
    skeletonItem.style.backgroundColor = `rgba(0,0,0,.04)`;
  }
  if (isImg) {
    skeletonItem.style.backgroundColor = `rgba(0,0,0,.08)`;
  }
  skeletonItem.style.borderRadius = '8px';
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

    // console.log({
    //   lineHeight,
    //   numberedLineHeight,
    //   fontSize,
    //   height,
    //   isMultiline,
    //   width,
    //   text: node.textContent,
    //   parentElement
    // });
  }
});

// 合并行内太近的元素
traverseNodes(root, node=>{
  
})

traverseNodes(root!, node => {
  try {
    node.hidden = true;
    // node.style.color = 'transparent';
  } catch {}
});
