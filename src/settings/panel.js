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
            storage.save(settings);
            applyAppearance(settings);
            options.onChange(clone(settings));
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

        function render() {
            renderToggles();
            renderThemes();
            renderAccents();
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
