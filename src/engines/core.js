(function (root) {

    'use strict';

    const arkaGraphEngine = root.ArkaGraphEngine || {};

    arkaGraphEngine.registry = arkaGraphEngine.registry || {};
    arkaGraphEngine.TAU = Math.PI * 2;

    arkaGraphEngine.clamp = function (value, min, max) {
        return Math.max(min, Math.min(max, value));
    };

    arkaGraphEngine.clone = function (value) {
        if (value === undefined || value === null) {
            return value;
        }
        return JSON.parse(JSON.stringify(value));
    };

    arkaGraphEngine.register = function (key, definition) {
        this.registry[key] = definition;
        return definition;
    };

    arkaGraphEngine.segmentSnippet = function () {
        return (
            "if(thisProperty.numKeys<2){value}else{\n" +
            "var seg=1;\n" +
            "while(seg<thisProperty.numKeys-1&&key(seg+1).time<=time)seg++;\n" +
            "var t0=key(seg).time,t1=key(seg+1).time;\n" +
            "var v0=key(seg).value,v1=key(seg+1).value;\n" +
            "if(time<=t0){v0}else if(time>=t1){v1}else{\n" +
            "var t=(time-t0)/(t1-t0);\n"
        );
    };

    root.ArkaGraphEngine = arkaGraphEngine;

})(window);