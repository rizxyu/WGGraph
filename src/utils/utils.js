(function () {
    'use strict';
    const AG = window.AG;
    AG.clone = function (value) {
        return window.WGGraphEngine.clone(value);
    };
    AG.cssVar = function (name, fallback) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return value || fallback;
    };
    AG.dpr = function () {
        return window.devicePixelRatio || 1;
    };
})();