(function (root) {
    'use strict';

    const storage = root.ArkaGraphSettingsStorage;

    const THEMES = [
        {
            id: 'carbon',
            label: 'Carbon',
            note: 'Original graphite panel.',
            colors: {
                bg0: '#090909',
                bg1: '#111111',
                bg2: '#181818',
                bg3: '#222222',
                border: '#2a2a2a',
                border2: '#333333',
                text0: '#f0f0f0',
                text1: '#a0a0a0',
                text2: '#555555',
                canvasBg: '#111111',
                gridLine: '#1e1e1e',
                gridDiagonal: '#222222',
                gridBorder: '#252525',
                presetPreviewBg: '#1a1a1a'
            }
        },
        {
            id: 'steel',
            label: 'Steel',
            note: 'Cool studio slate.',
            colors: {
                bg0: '#0b1116',
                bg1: '#101820',
                bg2: '#17212a',
                bg3: '#1d2a35',
                border: '#283643',
                border2: '#314150',
                text0: '#edf4f8',
                text1: '#9ab0bf',
                text2: '#5f7482',
                canvasBg: '#101820',
                gridLine: '#1b2831',
                gridDiagonal: '#243540',
                gridBorder: '#2a3b47',
                presetPreviewBg: '#16232c'
            }
        },
        {
            id: 'olive',
            label: 'Olive',
            note: 'Muted tactical dark.',
            colors: {
                bg0: '#0d100d',
                bg1: '#131813',
                bg2: '#1a2018',
                bg3: '#232a21',
                border: '#30392d',
                border2: '#3b4637',
                text0: '#f1f4eb',
                text1: '#a5b09c',
                text2: '#677061',
                canvasBg: '#131813',
                gridLine: '#202720',
                gridDiagonal: '#293129',
                gridBorder: '#313931',
                presetPreviewBg: '#1b221a'
            }
        }
    ];

    const ACCENTS = [
        {
            id: 'mint',
            label: 'Mint',
            colors: {
                accent: '#00c4a7',
                accent2: '#00e5c2',
                accentd: '#007a68',
                graphLine: '#00c4a7',
                graphFill: 'rgba(0, 196, 167, 0.07)',
                ghostLine: 'rgba(193, 255, 246, 0.24)',
                ghostFill: 'rgba(193, 255, 246, 0.045)',
                nodeSecondary: '#00c4a7'
            }
        },
        {
            id: 'amber',
            label: 'Amber',
            colors: {
                accent: '#f5c842',
                accent2: '#ffd96f',
                accentd: '#9f7f1e',
                graphLine: '#f5c842',
                graphFill: 'rgba(245, 200, 66, 0.08)',
                ghostLine: 'rgba(255, 227, 155, 0.24)',
                ghostFill: 'rgba(255, 227, 155, 0.045)',
                nodeSecondary: '#f5c842'
            }
        },
        {
            id: 'coral',
            label: 'Coral',
            colors: {
                accent: '#ff6b6b',
                accent2: '#ff8c8c',
                accentd: '#b94747',
                graphLine: '#ff6b6b',
                graphFill: 'rgba(255, 107, 107, 0.08)',
                ghostLine: 'rgba(255, 187, 187, 0.24)',
                ghostFill: 'rgba(255, 187, 187, 0.045)',
                nodeSecondary: '#ff6b6b'
            }
        },
        {
            id: 'cyan',
            label: 'Cyan',
            colors: {
                accent: '#34c8ff',
                accent2: '#7cdeff',
                accentd: '#187da0',
                graphLine: '#34c8ff',
                graphFill: 'rgba(52, 200, 255, 0.08)',
                ghostLine: 'rgba(175, 233, 255, 0.24)',
                ghostFill: 'rgba(175, 233, 255, 0.045)',
                nodeSecondary: '#34c8ff'
            }
        }
    ];
    const MAX_SOURCE_IMAGE_BYTES = 12 * 1024 * 1024;
    const MAX_STORED_IMAGE_BYTES = 1200 * 1024;
    const MAX_GIF_BYTES = 2200 * 1024;
    const MAX_GALLERY_ITEMS = 8;
    const MAX_GALLERY_BYTES = 4200 * 1024;
    const STILL_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function themeById(id) {
        return THEMES.find(function (theme) {
            return theme.id === id;
        }) || THEMES[0];
    }

    function accentById(id) {
        return ACCENTS.find(function (accent) {
            return accent.id === id;
        }) || ACCENTS[0];
    }

    function formatBytes(bytes) {
        if (!bytes) return '0 KB';
        if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function estimateDataUrlBytes(dataUrl) {
        const comma = dataUrl.indexOf(',');
        if (comma === -1) return dataUrl.length;
        return Math.ceil((dataUrl.length - comma - 1) * 0.75);
    }

    function readAsDataUrl(file) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onload = function () { resolve(reader.result); };
            reader.onerror = function () { reject(new Error('Unable to read file.')); };
            reader.readAsDataURL(file);
        });
    }

    function loadImage(dataUrl) {
        return new Promise(function (resolve, reject) {
            const image = new Image();
            image.onload = function () { resolve(image); };
            image.onerror = function () { reject(new Error('Unsupported image file.')); };
            image.src = dataUrl;
        });
    }

    function graphTargetSide() {
        const container = document.getElementById('canvas-container');
        const rect = container ? container.getBoundingClientRect() : { width: 320, height: 320 };
        const ratio = Math.min(2, window.devicePixelRatio || 1);
        const side = Math.max(rect.width || 320, rect.height || 320) * ratio * 2;
        return Math.max(640, Math.min(1280, Math.round(side)));
    }

    function detectImageType(file) {
        const type = (file.type || '').toLowerCase();
        const name = (file.name || '').toLowerCase();
        if (type === 'image/gif' || STILL_IMAGE_TYPES.indexOf(type) !== -1) return type;
        if (/\.gif$/.test(name)) return 'image/gif';
        if (/\.(jpe?g)$/.test(name)) return 'image/jpeg';
        if (/\.png$/.test(name)) return 'image/png';
        if (/\.webp$/.test(name)) return 'image/webp';
        return type;
    }

    function createBackgroundId() {
        return 'bg-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 100000).toString(36);
    }

    function getDefaultBackgrounds() {
        const links = Array.isArray(root.ArkaGraphBackgroundLinks) ? root.ArkaGraphBackgroundLinks : [];
        return links.filter(function (item) {
            return item && typeof item.url === 'string' && item.url;
        }).map(function (item, index) {
            return {
                id: typeof item.id === 'string' && item.id ? item.id : 'default-bg-' + index,
                dataUrl: item.url,
                type: item.type === 'gif' ? 'gif' : 'image',
                name: typeof item.name === 'string' ? item.name : 'Default Background',
                bytes: 0,
                source: 'default'
            };
        });
    }

    function userGalleryItems(gallery) {
        return Array.isArray(gallery) ? gallery.filter(function (item) {
            return item && item.source !== 'default';
        }) : [];
    }

    function visibleGallery(userGallery) {
        const defaults = getDefaultBackgrounds();
        const userItems = userGalleryItems(userGallery);
        const defaultUrls = defaults.map(function (item) { return item.dataUrl; });
        return defaults.concat(userItems.filter(function (item) {
            return defaultUrls.indexOf(item.dataUrl) === -1;
        }));
    }

    function findGalleryItem(gallery, id) {
        return gallery.find(function (item) {
            return item.id === id;
        });
    }

    function galleryBytes(gallery) {
        return gallery.reduce(function (total, item) {
            return total + (item.bytes || estimateDataUrlBytes(item.dataUrl || ''));
        }, 0);
    }

    function compactGallery(gallery, activeId) {
        let next = gallery.slice(0, MAX_GALLERY_ITEMS);
        while (galleryBytes(next) > MAX_GALLERY_BYTES && next.length > 1) {
            let removableIndex = next.length - 1;
            if (next[removableIndex].id === activeId) {
                removableIndex = Math.max(0, next.length - 2);
            }
            next.splice(removableIndex, 1);
        }
        return next;
    }

    function backgroundFromItem(item, enabled) {
        return {
            enabled: enabled !== false,
            dataUrl: item ? item.dataUrl : '',
            type: item ? item.type : '',
            name: item ? item.name : '',
            bytes: item ? item.bytes : 0,
            activeId: item ? item.id : '',
            source: item ? item.source || 'user' : '',
            gallery: []
        };
    }

    function withGallery(background, gallery) {
        const next = clone(background);
        next.gallery = gallery;
        return next;
    }

    function addGalleryItem(background, item) {
        const activeItem = {
            id: createBackgroundId(),
            dataUrl: item.dataUrl,
            type: item.type,
            name: item.name,
            bytes: item.bytes,
            source: 'user'
        };
        const existing = userGalleryItems(background.gallery);
        const deduped = existing.filter(function (galleryItem) {
            return galleryItem.dataUrl !== activeItem.dataUrl;
        });
        const gallery = compactGallery([activeItem].concat(deduped), activeItem.id);
        const next = withGallery(backgroundFromItem(activeItem, true), gallery);
        return {
            background: next,
            pruned: Math.max(0, existing.length + 1 - gallery.length)
        };
    }

    function canvasToCompressedDataUrl(canvas) {
        const qualities = [0.86, 0.8, 0.74, 0.68, 0.62, 0.56];
        let best = '';
        for (let i = 0; i < qualities.length; i++) {
            let dataUrl = canvas.toDataURL('image/webp', qualities[i]);
            if (dataUrl.indexOf('data:image/webp') !== 0) {
                dataUrl = canvas.toDataURL('image/jpeg', qualities[i]);
            }
            best = dataUrl;
            if (estimateDataUrlBytes(dataUrl) <= MAX_STORED_IMAGE_BYTES) {
                break;
            }
        }
        return best;
    }

    function compressStillImage(file) {
        if (file.size > MAX_SOURCE_IMAGE_BYTES) {
            return Promise.reject(new Error('Image is too large. Max ' + formatBytes(MAX_SOURCE_IMAGE_BYTES) + '.'));
        }

        return readAsDataUrl(file).then(function (sourceDataUrl) {
            return loadImage(sourceDataUrl).then(function (image) {
                const maxSide = graphTargetSide();
                const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
                const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
                const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = width;
                canvas.height = height;
                ctx.fillStyle = '#111111';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(image, 0, 0, width, height);

                const dataUrl = canvasToCompressedDataUrl(canvas);
                const bytes = estimateDataUrlBytes(dataUrl);
                if (bytes > MAX_STORED_IMAGE_BYTES) {
                    throw new Error('Compressed image is still too large. Try a simpler or smaller image.');
                }
                return {
                    enabled: true,
                    dataUrl: dataUrl,
                    type: 'image',
                    name: file.name || 'Image',
                    bytes: bytes
                };
            });
        });
    }

    function prepareGif(file) {
        if (file.size > MAX_GIF_BYTES) {
            return Promise.reject(new Error('GIF is too large. Max ' + formatBytes(MAX_GIF_BYTES) + '.'));
        }
        return readAsDataUrl(file).then(function (dataUrl) {
            return {
                enabled: true,
                dataUrl: dataUrl,
                type: 'gif',
                name: file.name || 'GIF',
                bytes: estimateDataUrlBytes(dataUrl)
            };
        });
    }

    function applyAppearance(settings) {
        const rootStyle = document.documentElement.style;
        const theme = themeById(settings.appearance.theme);
        const accent = accentById(settings.appearance.accent);

        Object.keys(theme.colors).forEach(function (key) {
            const cssName = key.replace(/[A-Z]/g, function (match) {
                return '-' + match.toLowerCase();
            });
            rootStyle.setProperty('--' + cssName, theme.colors[key]);
        });

        Object.keys(accent.colors).forEach(function (key) {
            const cssName = key.replace(/[A-Z]/g, function (match) {
                return '-' + match.toLowerCase();
            });
            rootStyle.setProperty('--' + cssName, accent.colors[key]);
        });

        rootStyle.setProperty('--node-primary', '#f5c842');
        rootStyle.setProperty('--node-muted', '#555555');
        rootStyle.setProperty('--guide-line', 'rgba(245, 200, 66, 0.4)');
    }

    root.ArkaGraphSettingsPanel = function createSettingsPanel(options) {
        let settings = storage.merge(storage.defaults, options.initialSettings || {});

        function persistAndNotify() {
            const saved = storage.save(settings);
            applyAppearance(settings);
            options.onChange(clone(settings));
            return saved;
        }

        function setBackgroundMessage(message, type) {
            if (!options.backgroundMessage) return;
            options.backgroundMessage.textContent = message || '';
            options.backgroundMessage.className = 'settings-bg-message' + (type ? ' ' + type : '');
        }

        function renderThemes() {
            options.themeGrid.innerHTML = '';
            THEMES.forEach(function (theme) {
                const button = document.createElement('button');
                const preview = document.createElement('div');
                const name = document.createElement('div');
                const note = document.createElement('div');

                button.type = 'button';
                button.className = 'settings-theme-card';
                if (settings.appearance.theme === theme.id) {
                    button.classList.add('active');
                }

                preview.className = 'theme-preview';
                [theme.colors.bg0, theme.colors.bg1, theme.colors.bg2, theme.colors.bg3].forEach(function (color) {
                    const swatch = document.createElement('span');
                    swatch.className = 'theme-preview-swatch';
                    swatch.style.background = color;
                    preview.appendChild(swatch);
                });

                name.className = 'settings-theme-name';
                name.textContent = theme.label;
                note.className = 'settings-theme-note';
                note.textContent = theme.note;

                button.appendChild(preview);
                button.appendChild(name);
                button.appendChild(note);
                button.addEventListener('click', function () {
                    settings.appearance.theme = theme.id;
                    renderThemes();
                    persistAndNotify();
                });

                options.themeGrid.appendChild(button);
            });
        }

        function renderAccents() {
            options.accentGrid.innerHTML = '';
            ACCENTS.forEach(function (accent) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'settings-accent-swatch';
                if (settings.appearance.accent === accent.id) {
                    button.classList.add('active');
                }
                button.style.background = accent.colors.accent;
                button.title = accent.label;
                button.setAttribute('aria-label', accent.label);
                button.addEventListener('click', function () {
                    settings.appearance.accent = accent.id;
                    renderAccents();
                    persistAndNotify();
                });
                options.accentGrid.appendChild(button);
            });
        }

        function renderToggles() {
            options.enableMirror.checked = settings.features.mirrorEnabled;
            options.enableGhost.checked = settings.features.ghostEnabled;
        }

        function renderBackground() {
            const bg = settings.background || {};
            const hasBackground = !!bg.dataUrl;
            const userGallery = userGalleryItems(bg.gallery);
            const gallery = visibleGallery(userGallery);
            const activeItem = findGalleryItem(gallery, bg.activeId);
            const activeIsDefault = !!(activeItem && activeItem.source === 'default');
            options.backgroundEnabled.checked = hasBackground && bg.enabled;
            options.backgroundEnabled.disabled = !hasBackground;
            options.backgroundRemove.disabled = !hasBackground || activeIsDefault;
            options.backgroundRemove.textContent = activeIsDefault ? 'Locked' : 'Remove';
            options.backgroundRemove.title = activeIsDefault ? 'Default backgrounds cannot be removed.' : 'Remove selected background';
            options.backgroundChoose.disabled = false;
            options.backgroundChoose.textContent = 'Add';
            options.backgroundPreview.classList.toggle('active', hasBackground);
            options.backgroundPreview.style.backgroundImage = hasBackground ? 'url("' + bg.dataUrl + '")' : '';

            if (options.backgroundGallery) {
                options.backgroundGallery.innerHTML = '';
                gallery.forEach(function (item) {
                    const button = document.createElement('button');
                    const label = document.createElement('span');
                    button.type = 'button';
                    button.className = 'settings-bg-thumb';
                    if (item.id === bg.activeId) {
                        button.classList.add('active');
                    }
                    if (item.source === 'default') {
                        button.classList.add('default');
                    }
                    button.style.backgroundImage = 'url("' + item.dataUrl + '")';
                    button.title = item.name || 'Background';
                    button.setAttribute('aria-label', item.name || 'Background');
                    label.className = 'settings-bg-type';
                    label.textContent = item.type === 'gif' ? 'GIF' : 'IMG';
                    button.appendChild(label);
                    button.addEventListener('click', function () {
                        const next = withGallery(backgroundFromItem(item, true), userGallery);
                        commitBackground(next, 'Background selected.');
                    });
                    options.backgroundGallery.appendChild(button);
                });
            }

            if (gallery.length) {
                setBackgroundMessage('Saved ' + userGallery.length + '/' + MAX_GALLERY_ITEMS + ' - ' + formatBytes(galleryBytes(userGallery)) + '/' + formatBytes(MAX_GALLERY_BYTES) + ' + ' + getDefaultBackgrounds().length + ' defaults', 'ok');
            } else {
                setBackgroundMessage('No background selected.', '');
            }
        }

        function commitBackground(nextBackground, successMessage) {
            const previous = clone(settings.background);
            settings.background = nextBackground;
            if (!persistAndNotify()) {
                settings.background = previous;
                storage.save(settings);
                applyAppearance(settings);
                options.onChange(clone(settings));
                renderBackground();
                setBackgroundMessage('Could not save background. Try a smaller file.', 'err');
                return;
            }
            renderBackground();
            if (successMessage) setBackgroundMessage(successMessage, 'ok');
        }

        function render() {
            renderToggles();
            renderThemes();
            renderAccents();
            renderBackground();
        }

        function open() {
            options.backdrop.classList.remove('hidden');
        }

        function close() {
            options.backdrop.classList.add('hidden');
        }

        options.enableMirror.addEventListener('change', function () {
            settings.features.mirrorEnabled = options.enableMirror.checked;
            persistAndNotify();
        });

        options.enableGhost.addEventListener('change', function () {
            settings.features.ghostEnabled = options.enableGhost.checked;
            persistAndNotify();
        });

        options.backgroundEnabled.addEventListener('change', function () {
            if (!settings.background.dataUrl) {
                options.backgroundEnabled.checked = false;
                setBackgroundMessage('Choose a background first.', 'warn');
                return;
            }
            settings.background.enabled = options.backgroundEnabled.checked;
            persistAndNotify();
            renderBackground();
        });

        options.backgroundChoose.addEventListener('click', function () {
            options.backgroundInput.value = '';
            options.backgroundInput.click();
        });

        options.backgroundRemove.addEventListener('click', function () {
            const bg = settings.background || {};
            const gallery = userGalleryItems(bg.gallery);
            if (bg.source === 'default') {
                setBackgroundMessage('Default backgrounds are locked.', 'warn');
                renderBackground();
                return;
            }
            const activeUserItem = findGalleryItem(gallery, bg.activeId);
            const nextGallery = gallery.filter(function (item) {
                return item.id !== bg.activeId;
            });
            if (activeUserItem && nextGallery.length) {
                commitBackground(withGallery(backgroundFromItem(nextGallery[0], true), nextGallery), 'Background removed.');
            } else if (activeUserItem) {
                const emptyBackground = clone(storage.defaults.background);
                emptyBackground.gallery = nextGallery;
                commitBackground(emptyBackground, 'Background removed.');
            } else {
                const emptyBackground = clone(storage.defaults.background);
                emptyBackground.gallery = gallery;
                commitBackground(emptyBackground, 'Background disabled.');
            }
        });

        options.backgroundInput.addEventListener('change', function () {
            const file = options.backgroundInput.files && options.backgroundInput.files[0];
            if (!file) return;

            setBackgroundMessage('Preparing background...', 'warn');

            let task = null;
            const type = detectImageType(file);
            if (type === 'image/gif') {
                task = prepareGif(file);
            } else if (STILL_IMAGE_TYPES.indexOf(type) !== -1) {
                task = compressStillImage(file);
            } else {
                setBackgroundMessage('Use PNG, JPG, WebP, or GIF.', 'err');
                return;
            }

            task.then(function (background) {
                const result = addGalleryItem(settings.background || clone(storage.defaults.background), background);
                const message = result.pruned ? 'Background saved. Old gallery item trimmed.' : 'Background saved.';
                commitBackground(result.background, message);
            }).catch(function (error) {
                setBackgroundMessage(error && error.message ? error.message : 'Unable to use that file.', 'err');
            });
        });

        options.openButton.addEventListener('click', open);
        options.closeButtons.forEach(function (button) {
            button.addEventListener('click', close);
        });

        options.backdrop.addEventListener('click', function (event) {
            if (event.target === options.backdrop) {
                close();
            }
        });

        applyAppearance(settings);
        render();

        return {
            getSettings: function () {
                return clone(settings);
            },
            open: open,
            close: close,
            refresh: render
        };
    };
})(window);
