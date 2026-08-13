import './style.css'
import { registerRoutes, initRouter } from './router/router.js'
import { withAdminGuard } from './lib/auth.js'
import { homePage } from './pages/home.js'
import { productosPage } from './pages/productos.js'
import { productoDetallePage } from './pages/producto-detalle.js'
import { adminLoginPage } from './pages/admin/login.js'
import { adminProductosPage } from './pages/admin/productos.js'
import { adminProductoFormPage } from './pages/admin/producto-form.js'
import { notFoundPage } from './pages/not-found.js'

registerRoutes([
  { path: '/', view: homePage },
  { path: '/productos', view: productosPage },
  { path: '/productos/:slug', view: productoDetallePage },
  { path: '/admin/login', view: adminLoginPage },
  { path: '/admin/productos', view: withAdminGuard(adminProductosPage) },
  { path: '/admin/productos/nuevo', view: withAdminGuard(adminProductoFormPage) },
  { path: '/admin/productos/:id', view: withAdminGuard(adminProductoFormPage) },
  { path: '/404', view: notFoundPage },
])

initRouter()
