(function (root) {
    'use strict';

    const STORAGE_KEYS = {
        userPresets: 'arkaGraph.userPresets.v1',
        builtinFavorites: 'arkaGraph.builtinFavorites.v1'
    };

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function safeRead(key, fallback) {
        try {
            const raw = root.localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function safeWrite(key, value) {
        try {
            root.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {}
    }

    root.ArkaGraphPresetStorage = {
        loadUserPresets: function () {
            const stored = safeRead(STORAGE_KEYS.userPresets, []);
            return Array.isArray(stored) ? stored.map(clone) : [];
        },
        saveUserPresets: function (presets) {
            safeWrite(STORAGE_KEYS.userPresets, presets.map(clone));
        },
        loadBuiltinFavorites: function () {
            const stored = safeRead(STORAGE_KEYS.builtinFavorites, []);
            return Array.isArray(stored) ? stored.slice() : [];
        },
        saveBuiltinFavorites: function (favoriteIds) {
            safeWrite(STORAGE_KEYS.builtinFavorites, favoriteIds.slice());
        }
    };
})(window);
