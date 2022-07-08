import {traverseNodes} from './traverseNodes';

const root = document.getElementById('root');
const skeleton = document.createElement('div');
skeleton.id = 'skeleton';
root?.after(skeleton);

// 处理多行文字
traverseNodes(root!, node => {
  if (node.nodeType === Node.TEXT_NODE && /\S/.test(node.nodeValue!)) {
    const {parentElement} = node;
    const rect = parentElement!.getBoundingClientRect();
    const {top, left, width, height} = rect;
    const {lineHeight, fontSize} = getComputedStyle(parentElement!);

    const numberedFontSize = +fontSize.replace('px', '');
    // const numberedLineHeight = lineHeight === 'normal' ? 

    const isSingleline = rect.height < numberedFontSize * 2;
    const isMultiline = !isSingleline;

    if (isSingleline) {
      const skeletonItem = document.createElement('div');
      skeleton.appendChild(skeletonItem)
      skeletonItem.className = 'skeleton-item';
      skeletonItem.style.position = 'absolute';
      skeletonItem.style.top = `${top}px`;
      skeletonItem.style.left = `${left}px`;
      skeletonItem.style.width = `${width}px`;
      skeletonItem.style.height = `${height}px`;
      skeletonItem.style.backgroundColor = `rgba(0,0,0,.08)`;
      skeletonItem.style.borderRadius = '8px';
    }

    console.log({
      lineHeight,
      fontSize,
      height,
      isMultiline
    });
  }
});
