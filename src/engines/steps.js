(function (root) {

    'use strict';

    const arkaGraphEngine = root.ArkaGraphEngine;
    const clamp = arkaGraphEngine.clamp;

    const Steps = {

        key: 'steps',

        defaults: { count: 8, position: 'end' },

        sample: function (steps, params) {
            const config = params || this.defaults;
            const stepCount = Math.max(1, Math.floor(config.count));
            const resolution = Math.max(2, steps);
            const samples = [];

            for (let i = 0; i < resolution; i++) {
                const t = i / (resolution - 1);
                const value = Math.floor(t * stepCount) / stepCount;
                samples.push({
                    t: t,
                    v: t >= 1 ? 1 : clamp(value, 0, 1)
                });
            }

            return samples;
        },

        expression: function (params) {
            return (
                "var steps=" + Math.floor(params.count) + ";\n" +
                "if(thisProperty.numKeys<2){value}else{\n" +
                "var seg=1;\n" +
                "while(seg<thisProperty.numKeys-1&&key(seg+1).time<=time)seg++;\n" +
                "var t0=key(seg).time,t1=key(seg+1).time;\n" +
                "var v0=key(seg).value,v1=key(seg+1).value;\n" +
                "if(time<=t0){v0}else if(time>=t1){v1}else{\n" +
                "var t=(time-t0)/(t1-t0); var ease=Math.floor(t*steps)/steps;\n" +
                "if(v0.length){var r=[];for(var j=0;j<v0.length;j++)r.push(v0[j]+(v1[j]-v0[j])*ease);r}else{v0+(v1-v0)*ease}}}"
            );
        }
    };

    arkaGraphEngine.Steps = arkaGraphEngine.register(Steps.key, Steps);

})(window);