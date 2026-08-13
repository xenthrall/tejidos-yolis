const routes = []

// import.meta.env.BASE_URL always ends with '/' (e.g. '/' or '/nativa/').
// Stripping the trailing slash gives '' for a root deploy and '/nativa' for a
// subpath deploy, so app routes can stay written as plain absolute paths
// ('/productos') and this is the only place that needs to know the base.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export function link(path) {
  return BASE + path
}

function appPath() {
  const pathname = location.pathname
  if (BASE && pathname.startsWith(BASE)) {
    return pathname.slice(BASE.length) || '/'
  }
  return pathname
}

export function registerRoutes(newRoutes) {
  routes.push(...newRoutes)
}

function pathToRegex(path) {
  return new RegExp(
    '^' + path.replace(/:\w+/g, '([^/]+)').replace(/\//g, '\\/') + '$'
  )
}

function paramNames(path) {
  return Array.from(path.matchAll(/:(\w+)/g)).map((match) => match[1])
}

function matchRoute() {
  const currentPath = appPath()

  for (const route of routes) {
    const result = currentPath.match(pathToRegex(route.path))
    if (result) {
      const values = result.slice(1)
      const params = Object.fromEntries(
        paramNames(route.path).map((name, i) => [name, values[i]])
      )
      return { route, params }
    }
  }
  return null
}

async function render() {
  const app = document.querySelector('#app')
  const match = matchRoute() ?? {
    route: routes.find((r) => r.path === '/404'),
    params: {},
  }

  if (!match.route) return

  app.innerHTML = ''
  await match.route.view({ params: match.params, mount: app })

  if (location.hash) {
    document.getElementById(location.hash.slice(1))?.scrollIntoView()
  } else {
    window.scrollTo(0, 0)
  }
}

// `path` is a full path already including the base (build it with `link()`).
export function navigate(path) {
  if (path !== location.pathname) {
    history.pushState(null, '', path)
  }
  render()
}

export function initRouter() {
  document.body.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[data-link]')
    if (!anchor) return
    event.preventDefault()
    navigate(anchor.getAttribute('href'))
  })

  window.addEventListener('popstate', render)

  render()
}
