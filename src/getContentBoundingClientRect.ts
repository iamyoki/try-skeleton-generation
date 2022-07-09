type Writeable<T> = {
  -readonly [P in keyof T]: T[P];
};

export function getContentBoundingClientRect(element: HTMLElement) {
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
