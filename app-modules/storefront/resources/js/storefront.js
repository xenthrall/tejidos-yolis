const detail = document.querySelector('[data-product-detail]');

if (detail) {
    const config = JSON.parse(detail.querySelector('[data-product-config]').textContent);
    const mainPhoto = detail.querySelector('[data-main-photo]');
    const thumbnails = detail.querySelector('[data-thumbnails]');
    const lightbox = detail.querySelector('[data-lightbox]');
    const zoomPhoto = detail.querySelector('[data-zoom-photo]');
    const picker = detail.querySelector('[data-variant-select]');
    const whatsapp = detail.querySelector('[data-whatsapp]');
    let visibleImages = config.images;

    function selectImage(index) {
        const photo = visibleImages[index];
        if (!photo || !mainPhoto) return;
        mainPhoto.src = photo.url;
        mainPhoto.alt = photo.alt;
        zoomPhoto.src = photo.url;
        zoomPhoto.alt = photo.alt;
        thumbnails.querySelectorAll('button').forEach((button, position) => {
            button.setAttribute('aria-pressed', String(position === index));
        });
    }

    function renderGallery(variantId) {
        const matching = config.images.filter(image => image.variantId === null || Number(image.variantId) === variantId);
        visibleImages = matching.length ? matching : config.images;
        thumbnails.replaceChildren();
        visibleImages.forEach((photo, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('aria-label', `Ver foto ${index + 1}`);
            const image = document.createElement('img');
            image.src = photo.thumbnail;
            image.alt = photo.alt;
            image.width = 100;
            image.height = 125;
            image.loading = 'lazy';
            button.append(image);
            button.addEventListener('click', () => selectImage(index));
            thumbnails.append(button);
        });
        selectImage(0);
    }

    function selectVariant(id) {
        const variant = config.variants.find(item => Number(item.id) === Number(id));
        if (!variant) return;
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
        renderGallery(Number(variant.id));
    }

    picker?.addEventListener('change', () => selectVariant(picker.value));
    detail.querySelector('[data-zoom-open]').addEventListener('click', () => lightbox.showModal());
    detail.querySelector('[data-zoom-close]').addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', event => {
        if (event.target === lightbox) lightbox.close();
    });
    selectVariant(config.initialVariant);
}
