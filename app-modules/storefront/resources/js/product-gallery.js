const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export function createProductGallery(detail, config) {
    const mainButton = detail.querySelector('[data-zoom-open]');
    const mainPhoto = detail.querySelector('[data-main-photo]');
    const mainThumbnails = detail.querySelector('[data-thumbnails]');
    const dialog = detail.querySelector('[data-lightbox]');
    const stage = detail.querySelector('[data-zoom-stage]');
    const zoomPhoto = detail.querySelector('[data-zoom-photo]');
    const viewerThumbnails = detail.querySelector('[data-viewer-thumbnails]');
    const loading = detail.querySelector('[data-viewer-loading]');
    const error = detail.querySelector('[data-viewer-error]');
    const zoomIn = detail.querySelector('[data-zoom-in]');
    const zoomOut = detail.querySelector('[data-zoom-out]');
    const zoomReset = detail.querySelector('[data-zoom-reset]');
    const previousButtons = detail.querySelectorAll('[data-gallery-previous], [data-viewer-previous]');
    const nextButtons = detail.querySelectorAll('[data-gallery-next], [data-viewer-next]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointers = new Map();
    const allImages = Array.isArray(config.images) ? config.images : [];
    let images = allImages;
    let current = 0;
    let zoom = 1;
    let panX = 0;
    let panY = 0;
    let drag = null;
    let pinch = null;
    let hadPinch = false;
    let moved = false;
    let lastTap = null;
    let mainSwipe = null;
    let suppressOpenUntil = 0;
    let opener = null;
    let previousOverflow = '';
    let modalActive = false;
    let wheelTimer;

    function updateTransform() {
        const fit = zoomPhoto.naturalWidth && zoomPhoto.naturalHeight
            ? Math.min(stage.clientWidth / zoomPhoto.naturalWidth, stage.clientHeight / zoomPhoto.naturalHeight)
            : 0;
        const limitX = Math.max(0, (zoomPhoto.naturalWidth * fit * zoom - stage.clientWidth) / 2);
        const limitY = Math.max(0, (zoomPhoto.naturalHeight * fit * zoom - stage.clientHeight) / 2);
        panX = clamp(panX, -limitX, limitX);
        panY = clamp(panY, -limitY, limitY);
        zoomPhoto.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`;
        stage.classList.toggle('is-zoomed', zoom > 1.01);
        zoomIn.disabled = zoom >= 4;
        zoomOut.disabled = zoom <= 1;
        zoomReset.textContent = `${Math.round(zoom * 100)}%`;
    }

    function resetZoom() {
        zoom = 1;
        panX = 0;
        panY = 0;
        updateTransform();
    }

    function zoomTo(value, clientX, clientY) {
        const next = clamp(value, 1, 4);
        const bounds = stage.getBoundingClientRect();
        const x = (clientX ?? bounds.left + bounds.width / 2) - bounds.left - bounds.width / 2;
        const y = (clientY ?? bounds.top + bounds.height / 2) - bounds.top - bounds.height / 2;
        panX = x - (x - panX) * next / zoom;
        panY = y - (y - panY) * next / zoom;
        zoom = next;
        updateTransform();
    }

    function centerThumbnail(strip) {
        const selected = strip.querySelector('[aria-pressed="true"]');
        if (!selected) return;
        strip.scrollTo({
            left: selected.offsetLeft - strip.offsetLeft - strip.clientWidth / 2 + selected.offsetWidth / 2,
            behavior: reducedMotion.matches ? 'auto' : 'smooth',
        });
    }

    function imageReady() {
        loading.hidden = true;
        error.hidden = true;
        zoomPhoto.hidden = false;
        updateTransform();
    }

    function imageFailed() {
        loading.hidden = true;
        error.hidden = false;
        zoomPhoto.hidden = true;
    }

    function loadViewerPhoto() {
        if (!images[current]) return;
        loading.hidden = false;
        error.hidden = true;
        zoomPhoto.hidden = true;
        zoomPhoto.alt = images[current].alt || config.name;
        zoomPhoto.src = images[current].url;
        if (zoomPhoto.complete) {
            if (zoomPhoto.naturalWidth) imageReady();
            else imageFailed();
        }
        if (images.length > 1 && !navigator.connection?.saveData) {
            const next = new Image();
            next.src = images[(current + 1) % images.length].url;
        }
    }

    function cancelPointers() {
        const captured = [...pointers.keys()];
        pointers.clear();
        for (const id of captured) {
            if (stage.hasPointerCapture(id)) stage.releasePointerCapture(id);
        }
        drag = null;
        pinch = null;
        hadPinch = false;
        stage.classList.remove('is-manipulating');
    }

    function select(index) {
        if (!images.length) return;
        cancelPointers();
        current = (index + images.length) % images.length;
        const photo = images[current];
        if (mainPhoto) {
            mainPhoto.src = photo.url;
            mainPhoto.alt = photo.alt || config.name;
        }
        for (const strip of [mainThumbnails, viewerThumbnails]) {
            strip.querySelectorAll('button').forEach((button, position) => {
                button.setAttribute('aria-pressed', String(position === current));
            });
            centerThumbnail(strip);
        }
        detail.querySelector('[data-main-counter]').textContent = `${current + 1} / ${images.length}`;
        detail.querySelector('[data-viewer-counter]').textContent = `${current + 1} / ${images.length}`;
        detail.querySelector('[data-gallery-announcement]').textContent = `Fotografía ${current + 1} de ${images.length}`;
        resetZoom();
        lastTap = null;
        if (dialog.open) loadViewerPhoto();
    }

    function makeThumbnails(strip) {
        strip.replaceChildren();
        images.forEach((photo, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('aria-label', `Ver fotografía ${index + 1} de ${images.length}`);
            const image = document.createElement('img');
            image.src = photo.thumbnail || photo.url;
            image.alt = '';
            image.width = 100;
            image.height = 125;
            image.loading = 'lazy';
            image.draggable = false;
            button.append(image);
            button.addEventListener('click', () => select(index));
            strip.append(button);
        });
        strip.hidden = images.length < 2;
    }

    function setVariant(variantId) {
        const previousUrl = images[current]?.url;
        const matching = allImages.filter(photo => photo.variantId == null || Number(photo.variantId) === Number(variantId));
        images = matching.length ? matching : allImages;
        makeThumbnails(mainThumbnails);
        makeThumbnails(viewerThumbnails);
        [...previousButtons, ...nextButtons].forEach(button => { button.hidden = images.length < 2; });
        mainButton.disabled = !images.length;
        const retained = images.findIndex(photo => photo.url === previousUrl);
        select(retained >= 0 ? retained : 0);
    }

    function openViewer() {
        if (!images.length || dialog.open || performance.now() < suppressOpenUntil) return;
        opener = document.activeElement;
        previousOverflow = document.body.style.overflow;
        dialog.showModal();
        modalActive = true;
        document.body.style.overflow = 'hidden';
        document.documentElement.classList.add('sf-viewer-open');
        resetZoom();
        loadViewerPhoto();
        centerThumbnail(viewerThumbnails);
    }

    function cleanUpViewer() {
        if (!modalActive) return;
        modalActive = false;
        cancelPointers();
        lastTap = null;
        clearTimeout(wheelTimer);
        stage.classList.remove('is-manipulating');
        document.body.style.overflow = previousOverflow;
        document.documentElement.classList.remove('sf-viewer-open');
        resetZoom();
        if (opener?.isConnected) opener.focus({ preventScroll: true });
    }

    function beginPinch() {
        const [first, second] = [...pointers.values()];
        if (!first || !second) return;
        const bounds = stage.getBoundingClientRect();
        const x = (first.x + second.x) / 2 - bounds.left - bounds.width / 2;
        const y = (first.y + second.y) / 2 - bounds.top - bounds.height / 2;
        pinch = {
            distance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)),
            zoom,
            anchorX: (x - panX) / zoom,
            anchorY: (y - panY) / zoom,
        };
        hadPinch = true;
        lastTap = null;
    }

    stage.addEventListener('pointerdown', event => {
        if (!dialog.open || !zoomPhoto.naturalWidth || !error.hidden || (event.pointerType === 'mouse' && event.button !== 0)) return;
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        stage.setPointerCapture(event.pointerId);
        stage.classList.add('is-manipulating');
        if (pointers.size === 1) {
            drag = { x: event.clientX, y: event.clientY, panX, panY };
            moved = false;
            hadPinch = false;
        } else {
            beginPinch();
        }
    });

    stage.addEventListener('pointermove', event => {
        if (!pointers.has(event.pointerId)) return;
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointers.size >= 2 && pinch) {
            const [first, second] = [...pointers.values()];
            const bounds = stage.getBoundingClientRect();
            zoom = clamp(pinch.zoom * Math.hypot(second.x - first.x, second.y - first.y) / pinch.distance, 1, 4);
            panX = (first.x + second.x) / 2 - bounds.left - bounds.width / 2 - pinch.anchorX * zoom;
            panY = (first.y + second.y) / 2 - bounds.top - bounds.height / 2 - pinch.anchorY * zoom;
            moved = true;
            updateTransform();
        } else if (drag) {
            const x = event.clientX - drag.x;
            const y = event.clientY - drag.y;
            moved ||= Math.hypot(x, y) > 6;
            if (zoom > 1) {
                panX = drag.panX + x;
                panY = drag.panY + y;
                updateTransform();
            }
        }
    });

    function endPointer(event, cancelled = false) {
        if (!pointers.has(event.pointerId)) return;
        pointers.delete(event.pointerId);
        if (pointers.size) {
            const remaining = [...pointers.values()][0];
            drag = { x: remaining.x, y: remaining.y, panX, panY };
            pinch = null;
            return;
        }
        stage.classList.remove('is-manipulating');
        if (!cancelled && !hadPinch && drag) {
            const x = event.clientX - drag.x;
            const y = event.clientY - drag.y;
            if (zoom === 1 && Math.abs(x) > 45 && Math.abs(x) > Math.abs(y) * 1.25) {
                select(current + (x < 0 ? 1 : -1));
            } else if (!moved) {
                if (event.pointerType === 'mouse') {
                    zoomTo(zoom > 1 ? 1 : 2.5, event.clientX, event.clientY);
                } else {
                    const now = performance.now();
                    if (lastTap && now - lastTap.time < 320 && Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < 30) {
                        zoomTo(zoom > 1 ? 1 : 2.5, event.clientX, event.clientY);
                        lastTap = null;
                    } else {
                        lastTap = { time: now, x: event.clientX, y: event.clientY };
                    }
                }
            }
        }
        drag = null;
        pinch = null;
        hadPinch = false;
    }
    stage.addEventListener('pointerup', event => endPointer(event));
    stage.addEventListener('pointercancel', event => endPointer(event, true));
    stage.addEventListener('lostpointercapture', event => endPointer(event, true));
    stage.addEventListener('dblclick', event => event.preventDefault());
    stage.addEventListener('wheel', event => {
        if (!dialog.open || !zoomPhoto.naturalWidth || !error.hidden) return;
        event.preventDefault();
        stage.classList.add('is-manipulating');
        const delta = event.deltaY * (event.deltaMode === 1 ? 16 : 1);
        zoomTo(zoom * Math.exp(-delta * 0.002), event.clientX, event.clientY);
        clearTimeout(wheelTimer);
        wheelTimer = setTimeout(() => stage.classList.remove('is-manipulating'), 120);
    }, { passive: false });

    mainButton.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'touch') return;
        mainSwipe = mainSwipe ? null : { x: event.clientX, y: event.clientY };
    });
    mainButton.addEventListener('pointerup', event => {
        if (!mainSwipe) return;
        const x = event.clientX - mainSwipe.x;
        const y = event.clientY - mainSwipe.y;
        if (Math.abs(x) > 45 && Math.abs(x) > Math.abs(y) * 1.25) {
            suppressOpenUntil = performance.now() + 500;
            select(current + (x < 0 ? 1 : -1));
        }
        mainSwipe = null;
    });
    mainButton.addEventListener('pointercancel', () => { mainSwipe = null; });
    mainButton.addEventListener('click', openViewer);
    detail.querySelector('[data-zoom-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', cleanUpViewer);
    dialog.addEventListener('keydown', event => {
        if (!dialog.open || event.ctrlKey || event.altKey || event.metaKey) return;
        const actions = {
            ArrowLeft: () => select(current - 1), ArrowRight: () => select(current + 1),
            Home: () => select(0), End: () => select(images.length - 1),
            '+': () => zoomTo(zoom + 0.5), '=': () => zoomTo(zoom + 0.5),
            '-': () => zoomTo(zoom - 0.5), '0': resetZoom,
        };
        if (actions[event.key]) {
            event.preventDefault();
            actions[event.key]();
        }
    });
    previousButtons.forEach(button => button.addEventListener('click', () => select(current - 1)));
    nextButtons.forEach(button => button.addEventListener('click', () => select(current + 1)));
    zoomIn.addEventListener('click', () => zoomTo(zoom + 0.5));
    zoomOut.addEventListener('click', () => zoomTo(zoom - 0.5));
    zoomReset.addEventListener('click', resetZoom);
    zoomPhoto.addEventListener('load', imageReady);
    zoomPhoto.addEventListener('error', imageFailed);
    detail.querySelector('[data-gallery-retry]').addEventListener('click', () => {
        zoomPhoto.removeAttribute('src');
        loadViewerPhoto();
    });
    new ResizeObserver(() => {
        if (dialog.open) updateTransform();
    }).observe(stage);
    window.addEventListener('pagehide', () => {
        cleanUpViewer();
        if (dialog.open) dialog.close();
    });

    return { setVariant };
}
