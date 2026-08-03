// jsdom gaps the components rely on. Both are layout/media APIs it does not implement:
// the about section asks for `prefers-reduced-motion`, the experience section pulls the
// active timeline item into view.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

Element.prototype.scrollIntoView = () => undefined;
