(function (root) {
    'use strict';

    const STORAGE_KEY = 'arkaGraph.settings.v1';
    const DEFAULTS = {
        features: {
            mirrorEnabled: true,
            ghostEnabled: true
        },
        appearance: {
            theme: 'carbon',
            accent: 'mint'
        }
    };

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function mergeSettings(base, partial) {
        const next = clone(base);

        if (partial && partial.features) {
            next.features.mirrorEnabled = partial.features.mirrorEnabled !== false;
            next.features.ghostEnabled = partial.features.ghostEnabled !== false;
        }

        if (partial && partial.appearance) {
            if (partial.appearance.theme) {
                next.appearance.theme = partial.appearance.theme;
            }
            if (partial.appearance.accent) {
                next.appearance.accent = partial.appearance.accent;
            }
        }

        return next;
    }

    root.ArkaGraphSettingsStorage = {
        defaults: clone(DEFAULTS),
        load: function () {
            try {
                const raw = root.localStorage.getItem(STORAGE_KEY);
                if (!raw) {
                    return clone(DEFAULTS);
                }
                return mergeSettings(DEFAULTS, JSON.parse(raw));
            } catch (error) {
                return clone(DEFAULTS);
            }
        },
        save: function (settings) {
            try {
                root.localStorage.setItem(STORAGE_KEY, JSON.stringify(mergeSettings(DEFAULTS, settings)));
            } catch (error) {}
        },
        merge: mergeSettings
    };
})(window);
