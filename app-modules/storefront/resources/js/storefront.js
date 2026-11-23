import { createProductGallery } from './product-gallery.js';

document.documentElement.classList.add('sf-js');

const header = document.querySelector('.sf-header');
const navigation = document.querySelector('#sf-site-nav');
const menuButton = document.querySelector('[data-menu-toggle]');

if (header && navigation && menuButton) {
    function setMenu(open) {
        navigation.classList.toggle('is-open', open);
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        menuButton.querySelector('[data-menu-icon]').hidden = open;
        menuButton.querySelector('[data-close-menu-icon]').hidden = !open;
    }
    menuButton.hidden = false;
    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('click', event => {
        if (!header.contains(event.target)) setMenu(false);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
            setMenu(false);
            menuButton.focus();
        }
    });
    window.matchMedia('(min-width: 761px)').addEventListener('change', () => setMenu(false));
}

const filterPanel = document.querySelector('[data-filter-panel]');
if (filterPanel) {
    const mobile = window.matchMedia('(max-width: 760px)');
    filterPanel.open = !mobile.matches;
    mobile.addEventListener('change', () => { filterPanel.open = !mobile.matches; });
}

const detail = document.querySelector('[data-product-detail]');
if (detail) {
    const config = JSON.parse(detail.querySelector('[data-product-config]').textContent);
    const gallery = createProductGallery(detail, config);
    const picker = detail.querySelector('[data-variant-select]');
    const whatsapp = detail.querySelector('[data-whatsapp]');

    function selectVariant(id) {
        const variant = config.variants.find(item => Number(item.id) === Number(id));
        if (!variant) {
            gallery.setVariant(null);
            return;
        }
        const available = variant.stock > 0;
        detail.querySelector('[data-price]').textContent = variant.price;
        detail.querySelector('[data-sku]').textContent = variant.sku;
        const badge = detail.querySelector('[data-availability]');
        badge.textContent = available ? 'Disponible' : (config.unique ? 'Vendida' : 'Agotado');
        badge.classList.toggle('sf-pill-green', available);
        detail.querySelector('[data-stock-note]').textContent = available
            ? (config.unique ? 'Solo hay una pieza como esta.' : `${variant.stock} ${variant.stock === 1 ? 'unidad disponible' : 'unidades disponibles'}.`)
            : 'Esta presentación ya no está disponible. Puedes consultar por otras creaciones.';
        whatsapp.hidden = !available;
        detail.querySelector('[data-other-products]').hidden = available;
        const message = `Hola Yolis, me interesa ${config.name}${config.variants.length > 1 ? ` (${variant.name})` : ''}. Referencia: ${variant.sku}. ${config.url}`;
        whatsapp.href = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`;
        const attributes = detail.querySelector('[data-variant-attributes]');
        attributes.replaceChildren();
        Object.entries(variant.attributes).forEach(([name, value]) => {
            const row = document.createElement('div');
            const term = document.createElement('dt');
            const description = document.createElement('dd');
            term.textContent = name;
            description.textContent = value;
            row.append(term, description);
            attributes.append(row);
        });
        gallery.setVariant(variant.id);
    }

    picker?.addEventListener('change', () => selectVariant(picker.value));
    selectVariant(config.initialVariant);
}
