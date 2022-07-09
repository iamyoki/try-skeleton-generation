export class CloneElement {
  originalElement: HTMLElement;
  cloneElement: HTMLElement;

  constructor(orinalElement: HTMLElement, deep = true) {
    this.originalElement = orinalElement;
    this.cloneElement = orinalElement.cloneNode(deep) as HTMLElement;
  }

  replaceOriginal() {
    this.originalElement.replaceWith(this.cloneElement);
  }

  restore() {
    this.cloneElement.replaceWith(this.originalElement);
  }

  destory() {
    this.cloneElement.remove();
  }
}
