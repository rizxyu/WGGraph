(function (root) {

    'use strict';

    const arkaGraphEngine = root.ArkaGraphEngine;
    const TAU = arkaGraphEngine.TAU;

    const Elastic = {

        key: 'elastic',

        defaults: { amplitude: 1.2, frequency: 4.0, decay: 6.0, mode: 'out' },

        sample: function (steps, params) {
            const config = params || this.defaults;
            const samples = [];

            for (let i = 0; i < steps; i++) {
                const t = i / (steps - 1);
                if (t <= 0) { samples.push({ t: t, v: 0 }); continue; }
                if (t >= 1) { samples.push({ t: t, v: 1 }); continue; }

                const amplitude = Math.max(1, config.amplitude);
                const value = 1 - Math.exp(-config.decay * t) * (
                    Math.cos(config.frequency * TAU * t) +
                    (config.decay / (config.frequency * TAU)) * Math.sin(config.frequency * TAU * t)
                );

                samples.push({
                    t: t,
                    v: value * (1 + (amplitude - 1) * 0.3)
                });
            }

            return samples;
        },

        expression: function (params) {
            return (
                "var amp=" + params.amplitude.toFixed(4) + ",freq=" + params.frequency.toFixed(4) + ",dec=" + params.decay.toFixed(4) + ";\n" +
                "if(thisProperty.numKeys<2){value}else{\n" +
                "var seg=1;\n" +
                "while(seg<thisProperty.numKeys-1&&key(seg+1).time<=time)seg++;\n" +
                "var t0=key(seg).time,t1=key(seg+1).time;\n" +
                "var v0=key(seg).value,v1=key(seg+1).value;\n" +
                "if(time<=t0){v0}else if(time>=t1){v1}else{\n" +
                "var t=(time-t0)/(t1-t0); var TAU=Math.PI*2;\n" +
                "var ease=1-Math.exp(-dec*t)*(Math.cos(freq*TAU*t)+(dec/(freq*TAU))*Math.sin(freq*TAU*t));\n" +
                "ease=ease*(1+(amp-1)*0.3);\n" +
                "if(v0.length){var r=[];for(var j=0;j<v0.length;j++)r.push(v0[j]+(v1[j]-v0[j])*ease);r}else{v0+(v1-v0)*ease}}}"
            );
        }
    };

    arkaGraphEngine.Elastic = arkaGraphEngine.register(Elastic.key, Elastic);

})(window);