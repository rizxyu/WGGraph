(function (root) {
    'use strict';

    const arkaGraphEngine = root.ArkaGraphEngine;

    arkaGraphEngine.get = function (key) {
        return this.registry[key] || null;
    };

    arkaGraphEngine.createDefaultParams = function () {
        return {
            bezier: this.clone(this.Bezier.defaults),
            elastic: this.clone(this.Elastic.defaults),
            bounce: this.clone(this.Bounce.defaults),
            steps: this.clone(this.Steps.defaults),
            wave: this.clone(this.Wave.defaults),
            custom: this.clone(this.Custom.defaults)
        };
    };

    arkaGraphEngine.sample = function (key, params, steps) {
        const definition = this.get(key);
        if (!definition || typeof definition.sample !== 'function') {
            return [];
        }
        return definition.sample(steps, this.clone(params));
    };

    arkaGraphEngine.expression = function (key, params) {
        const definition = this.get(key);
        if (!definition || typeof definition.expression !== 'function') {
            return '';
        }
        return definition.expression(this.clone(params));
    };
})(window);
