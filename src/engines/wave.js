(function (root) {

    'use strict';

    const wggraphEngine = root.WGGraphEngine;
    const TAU = wggraphEngine.TAU;

    const Wave = {

        key: 'wave',

        defaults: { amplitude: 1.0, frequency: 3.0, phase: 0.0 },

        sample: function (steps, params) {
            const config = params || this.defaults;
            const samples = [];

            for (let i = 0; i < steps; i++) {
                const t = i / (steps - 1);
                const waveValue = 0.5 - 0.5 * Math.cos((t * config.frequency + config.phase) * TAU);
                samples.push({
                    t: t,
                    v: 0.5 + (waveValue - 0.5) * config.amplitude
                });
            }

            return samples;
        },

        expression: function (params) {
            return (
                "var amp=" + params.amplitude.toFixed(4) + ",freq=" + params.frequency.toFixed(4) + ",ph=" + params.phase.toFixed(4) + ";\n" +
                "if(thisProperty.numKeys<2){value}else{\n" +
                "var seg=1;\n" +
                "while(seg<thisProperty.numKeys-1&&key(seg+1).time<=time)seg++;\n" +
                "var t0=key(seg).time,t1=key(seg+1).time;\n" +
                "var v0=key(seg).value,v1=key(seg+1).value;\n" +
                "if(time<=t0){v0}else if(time>=t1){v1}else{\n" +
                "var t=(time-t0)/(t1-t0); var TAU=Math.PI*2;\n" +
                "var v=0.5-0.5*Math.cos((t*freq+ph)*TAU);\n" +
                "var ease=0.5+(v-0.5)*amp;\n" +
                "if(v0.length){var r=[];for(var j=0;j<v0.length;j++)r.push(v0[j]+(v1[j]-v0[j])*ease);r}else{v0+(v1-v0)*ease}}}"
            );
        }
    };

    wggraphEngine.Wave = wggraphEngine.register(Wave.key, Wave);

})(window);