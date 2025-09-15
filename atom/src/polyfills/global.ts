// Polyfill para global en navegadores
if (typeof global === 'undefined') {
  (window as any).global = globalThis;
}

// Polyfill para process si es necesario
if (typeof process === 'undefined') {
  (window as any).process = {
    env: {},
    version: '',
    versions: {},
    platform: 'browser',
    nextTick: (fn: Function) => setTimeout(fn, 0)
  };
}

export {};
