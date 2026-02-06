/**
 * DOM polyfills required by pdfjs-dist when running in Bun/Node.
 * Must be imported BEFORE any module that loads pdfjs-dist.
 */

if (typeof globalThis.DOMMatrix === "undefined") {
  (globalThis as Record<string, unknown>).DOMMatrix = class DOMMatrix {
    constructor() {
      return Object.assign(this, {
        a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
        m11: 1, m12: 0, m13: 0, m14: 0,
        m21: 0, m22: 1, m23: 0, m24: 0,
        m31: 0, m32: 0, m33: 1, m34: 0,
        m41: 0, m42: 0, m43: 0, m44: 1,
        is2D: true, isIdentity: true,
      });
    }
  };
}

if (typeof globalThis.ImageData === "undefined") {
  (globalThis as Record<string, unknown>).ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(w: number, h: number) {
      this.width = w;
      this.height = h;
      this.data = new Uint8ClampedArray(w * h * 4);
    }
  };
}

if (typeof globalThis.Path2D === "undefined") {
  (globalThis as Record<string, unknown>).Path2D = class Path2D {};
}
