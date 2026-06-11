const routes = new Map();
const paramRoutes = [];

export function route(path, fn) {
  if (path.includes(':')) {
    const keys = [];
    const regex = new RegExp(
      '^' + path.replace(/:([^/]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$'
    );
    paramRoutes.push({ regex, keys, fn });
  } else {
    routes.set(path, fn);
  }
}

export function navigate(path) {
  history.pushState(null, '', path);
  dispatch();
}

export function replaceState(path) {
  history.replaceState(null, '', path);
}

function dispatch() {
  const exact = routes.get(location.pathname);
  if (exact) { exact(); return; }
  for (const { regex, keys, fn } of paramRoutes) {
    const m = location.pathname.match(regex);
    if (m) {
      const params = Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      fn(params);
      return;
    }
  }
  routes.get('/')?.();
}

export function initRouter() {
  window.addEventListener('popstate', dispatch);
  dispatch();
}
