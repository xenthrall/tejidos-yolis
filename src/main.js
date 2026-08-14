import './style.css'
import { registerRoutes, initRouter } from './router/router.js'
import { withAdminGuard } from './lib/auth.js'
import { siteConfig } from './site.config.js'
import { homePage } from './pages/home.js'
import { productosPage } from './pages/productos.js'
import { productoDetallePage } from './pages/producto-detalle.js'
import { nosotrosPage } from './pages/nosotros.js'
import { contactoPage } from './pages/contacto.js'
import { adminLoginPage } from './pages/admin/login.js'
import { adminDashboardPage } from './pages/admin/dashboard.js'
import { adminProductosPage } from './pages/admin/productos.js'
import { adminProductoFormPage } from './pages/admin/producto-form.js'
import { adminCategoriasPage } from './pages/admin/categorias.js'
import { adminConfiguracionPage } from './pages/admin/configuracion.js'
import { notFoundPage } from './pages/not-found.js'

document.title = siteConfig.storeName

registerRoutes([
  { path: '/', view: homePage },
  { path: '/productos', view: productosPage },
  { path: '/productos/:slug', view: productoDetallePage },
  { path: '/nosotros', view: nosotrosPage },
  { path: '/contacto', view: contactoPage },
  { path: '/admin/login', view: adminLoginPage },
  { path: '/admin', view: withAdminGuard(adminDashboardPage) },
  { path: '/admin/productos', view: withAdminGuard(adminProductosPage) },
  { path: '/admin/productos/nuevo', view: withAdminGuard(adminProductoFormPage) },
  { path: '/admin/productos/:id', view: withAdminGuard(adminProductoFormPage) },
  { path: '/admin/categorias', view: withAdminGuard(adminCategoriasPage) },
  { path: '/admin/configuracion', view: withAdminGuard(adminConfiguracionPage) },
  { path: '/404', view: notFoundPage },
])

initRouter()
