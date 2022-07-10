type Shape = 'rect' | 'circle';
type RenderType = 'html' | 'svg' | 'canvas';

export class SkeletonItem {
  shape: Shape;
  top: number;
  bottom: number;
  left: number;
  right: number;
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(props: {
    shape: Shape;
    top: number;
    bottom: number;
    left: number;
    right: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    this.shape = props.shape;
    this.top = props.top;
    this.bottom = props.bottom;
    this.left = props.left;
    this.right = props.right;
    this.x = props.x;
    this.y = props.y;
    this.width = props.width;
    this.height = props.height;
  }
}

export class Skeleton {
  items: SkeletonItem[] = [];
  renderType: RenderType;
  renderRoot?: HTMLElement;
  readonly renderRootId = 'skeleton-render-root';

  constructor(options: {renderType?: RenderType}) {
    this.renderType = options.renderType ?? 'html';
  }

  append(...items: SkeletonItem[]) {
    this.items.push(...items);
  }

  render() {
    const isRootExist = document.getElementById(this.renderRootId);
    if (!isRootExist) {
      this.renderRoot = document.createElement('div');
      this.renderRoot.id = this.renderRootId;
      this.renderRoot.style.pointerEvents = 'none';
      this.renderRoot.style.position = 'relative';
      document.body.appendChild(this.renderRoot);
    }

    if (this.renderType === 'html') this.renderHTML();
  }

  renderHTML() {
    this.items.forEach(item => {
      const skeletonItem = document.createElement('div');
      skeletonItem.classList.add(
        'skeleton-item',
        `skeleton-item__${item.shape}`
      );
      skeletonItem.style.position = 'absolute';
      skeletonItem.style.top = `${item.top}px`;
      skeletonItem.style.left = `${item.left}px`;
      skeletonItem.style.width = `${item.width}px`;
      skeletonItem.style.height = `${item.height}px`;
      skeletonItem.style.backgroundColor = `rgba(0,0,0,.08)`;
      skeletonItem.style.borderRadius = '8px';
    });
  }
}
