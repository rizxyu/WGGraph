(function (root) {

    'use strict';

    const wggraphEngine = root.WGGraphEngine || {};

    wggraphEngine.registry = wggraphEngine.registry || {};
    wggraphEngine.TAU = Math.PI * 2;

    wggraphEngine.clamp = function (value, min, max) {
        return Math.max(min, Math.min(max, value));
    };

    wggraphEngine.clone = function (value) {
        if (value === undefined || value === null) {
            return value;
        }
        return JSON.parse(JSON.stringify(value));
    };

    wggraphEngine.register = function (key, definition) {
        this.registry[key] = definition;
        return definition;
    };

    wggraphEngine.segmentSnippet = function () {
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

    root.WGGraphEngine = wggraphEngine;

})(window);