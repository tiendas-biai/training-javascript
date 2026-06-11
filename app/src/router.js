const routes = new Map();

export function route(path, fn) {
  routes.set(path, fn);
}

export function navigate(path) {
  history.pushState(null, '', path);
  dispatch();
}

export function replaceState(path) {
  history.replaceState(null, '', path);
}

function dispatch() {
  const fn = routes.get(location.pathname) ?? routes.get('/');
  fn?.();
}

export function initRouter() {
  window.addEventListener('popstate', dispatch);
  dispatch();
}
