import {CloneElement} from './CloneElement.class';

export function getLineHeight(element: HTMLElement) {
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
