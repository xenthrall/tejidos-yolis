import { ArrowRight, MapPin, Leaf, Mountain, Heart } from "lucide";
import { renderHeader, bindHeaderEvents } from "../components/header.js";
import { renderFooter } from "../components/footer.js";
import {
  renderProductCard,
  renderProductCardSkeleton,
} from "../components/product-card.js";
import { getFeaturedProducts } from "../lib/products.js";
import { link } from "../router/router.js";
import { icon } from "../lib/icons.js";
import { siteConfig } from "../site.config.js";
import tejidosLogoSvg from "../assets/tejidos-yolis-oveja-logo.svg?raw";

const HIGHLIGHTS = [
  { emoji: "🐑", label: "Lana 100% de oveja" },
  { icon: Leaf, label: "Fibras naturales" },
  { icon: Mountain, label: "Tradición boyacense" },
  { icon: Heart, label: "Hecho con pasión" },
];

const HIGHLIGHT_SEPARATOR = `<span class="text-neutral-300 dark:text-neutral-700" aria-hidden="true">·</span>`;

function renderHighlight(item) {
  return `
    <span class="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
      ${item.icon ? icon(item.icon, { class: "h-3.5 w-3.5 shrink-0" }) : `<span aria-hidden="true">${item.emoji}</span>`}
      ${item.label}
    </span>
  `;
}

export async function homePage({ mount }) {
  mount.innerHTML = `
    ${renderHeader()}

    <main>
      <!-- Hero -->
      <section class="mx-auto max-w-3xl px-4 pb-12 pt-10 text-center sm:px-6 sm:pb-16 sm:pt-16">
        <div class="mx-auto mb-7 w-52 sm:mb-8 sm:w-64 md:w-72">
          ${tejidosLogoSvg}
        </div>

        <h1 class="mx-auto mt-4 max-w-md text-base leading-relaxed text-neutral-600 dark:text-neutral-300 sm:mt-5 sm:text-lg">
          Ruanas artesanales tejidas en telar horizontal, con fibras naturales y tradición boyacense.
        </h1>

        <div class="mt-3 flex items-center justify-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          ${icon(MapPin, { class: "h-4 w-4 shrink-0" })}
          ${siteConfig.location.name}
        </div>

        <div class="mt-6 flex flex-col items-stretch justify-center gap-3 sm:mt-7 sm:flex-row sm:items-center">
          <a
            href="${link("/productos")}"
            data-link
            class="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-6 py-3 font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-neutral-900"
          >
            Ver nuestras ruanas
          </a>

          <a
            href="${link("/nosotros")}"
            data-link
            class="inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Conoce nuestra historia
          </a>
        </div>

        <div class="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:mt-9 sm:gap-x-4">
          ${HIGHLIGHTS.map(renderHighlight).join(HIGHLIGHT_SEPARATOR)}
        </div>
      </section>

      <!-- Featured products -->
      <section id="destacados-section" class="border-t border-neutral-200 dark:border-neutral-800">
        <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div class="flex items-end justify-between gap-4">
            <div>
              <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Ruanas destacadas</h2>
              <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Algunas de nuestras piezas</p>
            </div>

            <a
              href="${link("/productos")}"
              data-link
              class="hidden items-center gap-1.5 text-sm font-medium hover:underline sm:inline-flex"
            >
              Ver catálogo
              ${icon(ArrowRight, { class: "h-4 w-4" })}
            </a>
          </div>

          <div id="destacados" class="mt-7 grid grid-cols-2 gap-4 sm:mt-8 sm:grid-cols-4 sm:gap-6">
            ${Array.from({ length: 4 }, renderProductCardSkeleton).join("")}
          </div>

          <div class="mt-8 text-center sm:hidden">
            <a
              href="${link("/productos")}"
              data-link
              class="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Ver todo el catálogo
              ${icon(ArrowRight, { class: "h-4 w-4" })}
            </a>
          </div>
        </div>
      </section>
    </main>

    ${renderFooter()}
  `;

  bindHeaderEvents(mount);

  const destacadosSection = mount.querySelector("#destacados-section");
  const destacados = mount.querySelector("#destacados");

  try {
    const products = await getFeaturedProducts();

    if (products.length === 0) {
      destacadosSection.remove();
      return;
    }

    destacados.innerHTML = products.map(renderProductCard).join("");
  } catch (error) {
    console.error(error);
    destacadosSection.remove();
  }
}
