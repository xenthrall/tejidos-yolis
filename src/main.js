import './style.css'

document.querySelector('#app').innerHTML = `
  <header class="border-b">
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <a href="/" class="text-xl font-semibold">
        Nativa
      </a>

      <div class="flex items-center gap-6 text-sm">
        <a href="#productos" class="hover:underline">Productos</a>
        <a href="#nosotros" class="hover:underline">Nosotros</a>
        <a href="#contacto" class="hover:underline">Contacto</a>
        <button type="button" aria-label="Carrito">
          Carrito
        </button>
      </div>
    </nav>
  </header>

  <main>
    <section class="mx-auto max-w-7xl px-6 py-24 text-center">
      <p class="mb-4 text-sm font-medium uppercase tracking-widest">
        Nativa
      </p>

      <h1 class="text-4xl font-bold tracking-tight sm:text-6xl">
        Productos con identidad
      </h1>

      <p class="mx-auto mt-6 max-w-2xl text-lg">
        Descubre nuestra selección de productos.
      </p>

      <a
        href="#productos"
        class="mt-8 inline-block rounded-lg bg-black px-6 py-3 text-white hover:opacity-80"
      >
        Ver productos
      </a>
    </section>

    <section id="productos" class="mx-auto max-w-7xl px-6 py-16">
      <div class="mb-8">
        <h2 class="text-2xl font-semibold">
          Productos destacados
        </h2>

        <p class="mt-2">
          Próximamente encontrarás aquí nuestro catálogo.
        </p>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article class="rounded-xl border p-6">
          <div class="mb-4 aspect-square rounded-lg bg-gray-100"></div>
          <h3 class="font-medium">Producto</h3>
          <p class="mt-2">$000.000</p>
        </article>

        <article class="rounded-xl border p-6">
          <div class="mb-4 aspect-square rounded-lg bg-gray-100"></div>
          <h3 class="font-medium">Producto</h3>
          <p class="mt-2">$000.000</p>
        </article>

        <article class="rounded-xl border p-6">
          <div class="mb-4 aspect-square rounded-lg bg-gray-100"></div>
          <h3 class="font-medium">Producto</h3>
          <p class="mt-2">$000.000</p>
        </article>

        <article class="rounded-xl border p-6">
          <div class="mb-4 aspect-square rounded-lg bg-gray-100"></div>
          <h3 class="font-medium">Producto</h3>
          <p class="mt-2">$000.000</p>
        </article>
      </div>
    </section>
  </main>

  <footer id="contacto" class="border-t">
    <div class="mx-auto max-w-7xl px-6 py-8 text-sm">
      <p>Nativa · Tequia</p>
    </div>
  </footer>
`