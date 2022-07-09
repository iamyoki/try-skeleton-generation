export function getElementTextWidth(element: HTMLElement) {
  const font = getComputedStyle(element).font;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  context.font = font;
  const {width} = context.measureText(element.textContent ?? '');
  canvas.remove();

  return width;
}
