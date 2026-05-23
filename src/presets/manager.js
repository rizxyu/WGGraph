(function (root) {
    'use strict';

    const storage = root.ArkaGraphPresetStorage;

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function createId(prefix) {
        return prefix + '-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    }

    root.ArkaGraphPresetManager = function createPresetManager(options) {
        const engine = options.engine;
        const dialog = options.dialog;
        const builtInPresets = engine.PRESETS.map(function (preset, index) {
            return normalizePreset(preset, true, 'builtin-' + index);
        });

        let currentEngine = options.initialEngine || 'bezier';
        let activePresetId = null;
        let userPresets = storage.loadUserPresets().map(function (preset, index) {
            return normalizePreset(preset, false, 'user-' + index);
        });
        let builtInFavorites = storage.loadBuiltinFavorites();

        function normalizePreset(preset, builtIn, fallbackId) {
            const defaults = clone(engine.get(preset.engine).defaults);
            const mergedParams = preset.params ? Object.assign(defaults, clone(preset.params)) : defaults;
            return {
                id: preset.id || fallbackId || createId(builtIn ? 'builtin' : 'user'),
                label: String(preset.label || 'Preset').trim(),
                engine: preset.engine,
                params: mergedParams,
                builtIn: builtIn,
                favorite: !!preset.favorite
            };
        }

        function persistUserPresets() {
            storage.saveUserPresets(userPresets.map(function (preset) {
                return {
                    id: preset.id,
                    label: preset.label,
                    engine: preset.engine,
                    params: preset.params,
                    favorite: !!preset.favorite
                };
            }));
        }

        function persistBuiltInFavorites() {
            storage.saveBuiltinFavorites(builtInFavorites.slice());
        }

        function isFavorite(preset) {
            return preset.builtIn
                ? builtInFavorites.indexOf(preset.id) !== -1
                : !!preset.favorite;
        }

        function setFavorite(preset, nextValue) {
            if (preset.builtIn) {
                if (nextValue) {
                    if (builtInFavorites.indexOf(preset.id) === -1) {
                        builtInFavorites.push(preset.id);
                    }
                } else {
                    builtInFavorites = builtInFavorites.filter(function (id) {
                        return id !== preset.id;
                    });
                }
                persistBuiltInFavorites();
            } else {
                preset.favorite = nextValue;
                persistUserPresets();
            }
        }

        function getAllPresets() {
            return builtInPresets.concat(userPresets);
        }

        function getVisiblePresets() {
            return getAllPresets()
                .filter(function (preset) {
                    return preset.engine === currentEngine;
                })
                .sort(function (left, right) {
                    if (isFavorite(left) !== isFavorite(right)) {
                        return isFavorite(left) ? -1 : 1;
                    }
                    if (left.builtIn !== right.builtIn) {
                        return left.builtIn ? -1 : 1;
                    }
                    return left.label.localeCompare(right.label);
                });
        }

        function getPresetById(id) {
            return getAllPresets().find(function (preset) {
                return preset.id === id;
            }) || null;
        }

        function findByName(name, engineKey) {
            const lowered = name.trim().toLowerCase();
            return getAllPresets().find(function (preset) {
                return preset.engine === engineKey && preset.label.trim().toLowerCase() === lowered;
            }) || null;
        }

        function makeUniqueName(baseName, engineKey) {
            let index = 2;
            let candidate = baseName;
            while (findByName(candidate, engineKey)) {
                candidate = baseName + ' ' + String(index).padStart(2, '0');
                index++;
            }
            return candidate;
        }

        function makeSuggestedName(engineKey) {
            return makeUniqueName(engineKey.toUpperCase(), engineKey);
        }

        function getPreviewSamples(preset) {
            if (preset.engine === 'bezier' && preset.params.mode === 'speed') {
                return engine.get('bezier').speedSample(30, preset.params);
            }
            return engine.sample(preset.engine, preset.params, 30);
        }

        function renderMiniPreview(context, preset) {
            const samples = getPreviewSamples(preset);
            const rootStyle = getComputedStyle(document.documentElement);
            const previewBg = rootStyle.getPropertyValue('--preset-preview-bg').trim() || '#1a1a1a';
            const graphLine = rootStyle.getPropertyValue('--graph-line').trim() || '#00c4a7';
            const ghostLine = rootStyle.getPropertyValue('--ghost-line').trim() || 'rgba(255,255,255,0.22)';

            context.fillStyle = previewBg;
            context.fillRect(0, 0, 72, 44);

            if (preset.engine === 'bezier' && preset.params.mode === 'speed') {
                context.strokeStyle = ghostLine;
                context.lineWidth = 1;
                context.beginPath();
                context.moveTo(4, 22);
                context.lineTo(68, 22);
                context.stroke();
            }

            if (!samples.length) {
                return;
            }

            context.beginPath();
            samples.forEach(function (sample, index) {
                const x = 4 + sample.t * 64;
                const y = preset.engine === 'bezier' && preset.params.mode === 'speed'
                    ? 22 - Math.max(-1.2, Math.min(1.2, sample.v)) * 12
                    : 40 - Math.max(-0.2, Math.min(1.2, sample.v)) * 36;

                if (index === 0) {
                    context.moveTo(x, y);
                } else {
                    context.lineTo(x, y);
                }
            });
            context.strokeStyle = graphLine;
            context.lineWidth = 1.5;
            context.stroke();
        }

        function createIcon(type) {
            const span = document.createElement('span');
            span.className = 'preset-icon-svg';

            if (type === 'save') {
                span.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h11l3 3v13H5z"/><path d="M8 4v6h8V4"/><path d="M9 18h6"/></svg>';
            } else if (type === 'star') {
                span.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.7 5.46 6.03.88-4.36 4.25 1.03 6.01L12 17.27 6.6 20.1l1.03-6.01-4.36-4.25 6.03-.88z"/></svg>';
            } else if (type === 'trash') {
                span.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M7 7l1 13h8l1-13"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>';
            } else if (type === 'close') {
                span.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>';
            }

            return span;
        }

        function markActive(id) {
            activePresetId = id;
            render();
        }

        function clearActivePreset() {
            if (activePresetId !== null) {
                activePresetId = null;
                render();
            }
        }

        function saveNewPreset(name, snapshot) {
            const preset = normalizePreset({
                id: createId('user'),
                label: name,
                engine: snapshot.engine,
                params: snapshot.params,
                favorite: false
            }, false);

            userPresets.push(preset);
            persistUserPresets();
            currentEngine = preset.engine;
            options.setStatus('PRESET SAVED ✓', 'ok');
            markActive(preset.id);
        }

        function replacePreset(targetPreset, snapshot, name) {
            targetPreset.label = name;
            targetPreset.engine = snapshot.engine;
            targetPreset.params = clone(snapshot.params);
            persistUserPresets();
            currentEngine = targetPreset.engine;
            options.setStatus('PRESET REPLACED ✓', 'ok');
            markActive(targetPreset.id);
        }

        function promptSave() {
            const snapshot = options.getCurrentSnapshot();

            dialog.openInput({
                title: 'Save Preset',
                description: 'Store the current graph in your library.',
                initialValue: makeSuggestedName(snapshot.engine),
                confirmLabel: 'Save',
                onConfirm: function (name, api) {
                    if (!name) {
                        api.setMessage('Preset name is required.', 'err');
                        return;
                    }

                    const existing = findByName(name, snapshot.engine);
                    if (!existing) {
                        saveNewPreset(name, snapshot);
                        api.close();
                        return;
                    }

                    const suggestedCopy = makeUniqueName(name, snapshot.engine);
                    api.setMessage('That preset name already exists.', 'warn');
                    api.showConflict({
                        title: 'Name conflict',
                        message: existing.builtIn
                            ? 'Built-in presets cannot be replaced.'
                            : 'Choose what to do with the existing preset.',
                        actions: existing.builtIn
                            ? [
                                {
                                    label: 'Save Copy',
                                    tone: 'accent',
                                    onClick: function () {
                                        saveNewPreset(suggestedCopy, snapshot);
                                        api.close();
                                    }
                                },
                                {
                                    label: 'Edit Name',
                                    tone: 'ghost',
                                    onClick: function () {
                                        api.setValue(suggestedCopy);
                                        api.clearConflict();
                                        api.setMessage('Adjusted the name so you can save a copy.', 'ok');
                                        api.focusInput();
                                    }
                                }
                            ]
                            : [
                                {
                                    label: 'Replace',
                                    tone: 'danger',
                                    onClick: function () {
                                        replacePreset(existing, snapshot, name);
                                        api.close();
                                    }
                                },
                                {
                                    label: 'Rename Copy',
                                    tone: 'accent',
                                    onClick: function () {
                                        saveNewPreset(suggestedCopy, snapshot);
                                        api.close();
                                    }
                                },
                                {
                                    label: 'Edit Name',
                                    tone: 'ghost',
                                    onClick: function () {
                                        api.setValue(suggestedCopy);
                                        api.clearConflict();
                                        api.setMessage('Adjusted the name so you can review it first.', 'ok');
                                        api.focusInput();
                                    }
                                }
                            ]
                    });
                }
            });
        }

        function promptDelete(preset) {
            dialog.openConfirm({
                title: 'Delete Preset',
                description: 'Remove "' + preset.label + '" from your library?',
                confirmLabel: 'Delete',
                tone: 'danger',
                onConfirm: function (_, api) {
                    userPresets = userPresets.filter(function (item) {
                        return item.id !== preset.id;
                    });
                    persistUserPresets();
                    if (activePresetId === preset.id) {
                        activePresetId = null;
                    }
                    options.setStatus('PRESET DELETED ✓', 'ok');
                    api.close();
                    render();
                }
            });
        }

        function toggleFavorite(preset) {
            setFavorite(preset, !isFavorite(preset));
            options.setStatus(isFavorite(preset) ? 'FAVORITE SAVED ✓' : 'FAVORITE REMOVED', isFavorite(preset) ? 'ok' : '');
            render();
        }

        function applyPreset(preset) {
            currentEngine = preset.engine;
            options.applyPreset({
                id: preset.id,
                label: preset.label,
                engine: preset.engine,
                params: clone(preset.params),
                builtIn: preset.builtIn
            });
            activePresetId = preset.id;
            render();
        }

        function createPresetCard(preset) {
            const card = document.createElement('button');
            const preview = document.createElement('canvas');
            const previewContext = preview.getContext('2d');
            const title = document.createElement('span');
            const badge = document.createElement('span');
            const actions = document.createElement('div');
            const favoriteButton = document.createElement('button');

            card.type = 'button';
            card.className = 'preset-card';
            if (activePresetId === preset.id) {
                card.classList.add('active');
            }
            if (preset.builtIn) {
                card.classList.add('builtin');
            } else {
                card.classList.add('user');
            }
            if (isFavorite(preset)) {
                card.classList.add('favorite');
            }

            preview.className = 'preset-mini-canvas';
            preview.width = 72;
            preview.height = 44;
            renderMiniPreview(previewContext, preset);

            title.className = 'preset-card-label';
            title.textContent = preset.label;

            badge.className = 'preset-card-badge';
            badge.textContent = preset.builtIn ? 'SYS' : 'USR';

            actions.className = 'preset-card-actions';

            favoriteButton.type = 'button';
            favoriteButton.className = 'preset-icon-btn favorite-toggle';
            favoriteButton.title = isFavorite(preset) ? 'Unfavorite preset' : 'Favorite preset';
            favoriteButton.appendChild(createIcon('star'));
            favoriteButton.addEventListener('click', function (event) {
                event.stopPropagation();
                event.preventDefault();
                toggleFavorite(preset);
            });

            actions.appendChild(favoriteButton);

            if (!preset.builtIn) {
                const deleteButton = document.createElement('button');
                deleteButton.type = 'button';
                deleteButton.className = 'preset-icon-btn delete-toggle';
                deleteButton.title = 'Delete preset';
                deleteButton.appendChild(createIcon('trash'));
                deleteButton.addEventListener('click', function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    promptDelete(preset);
                });
                actions.appendChild(deleteButton);
            }

            card.appendChild(actions);
            card.appendChild(preview);
            card.appendChild(title);
            card.appendChild(badge);
            card.addEventListener('click', function () {
                applyPreset(preset);
            });

            return card;
        }

        function render() {
            options.grid.innerHTML = '';
            getVisiblePresets().forEach(function (preset) {
                options.grid.appendChild(createPresetCard(preset));
            });
        }

        options.saveButton.innerHTML = '';
        options.saveButton.appendChild(createIcon('save'));
        options.closeDialogButton.innerHTML = '';
        options.closeDialogButton.appendChild(createIcon('close'));
        options.saveButton.addEventListener('click', promptSave);

        return {
            setEngine: function (engineKey, config) {
                currentEngine = engineKey;
                if (!(config && config.preserveActive) && activePresetId) {
                    const active = getPresetById(activePresetId);
                    if (!active || active.engine !== engineKey) {
                        activePresetId = null;
                    }
                }
                render();
            },
            clearActivePreset: clearActivePreset,
            markActive: markActive,
            refresh: render
        };
    };
})(window);
