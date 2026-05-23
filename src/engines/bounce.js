(function (root) {

    'use strict';

    const arkaGraphEngine = root.ArkaGraphEngine;
    const clamp = arkaGraphEngine.clamp;

    const Bounce = {

        key: 'bounce',

        defaults: { bounces: 3, restitution: 0.5, mode: 'out' },

        sample: function (steps, params) {
            const config = params || this.defaults;
            const samples = [];

            for (let i = 0; i < steps; i++) {
                const t = i / (steps - 1);
                samples.push({
                    t: t,
                    v: this.bounceOut(t, config.bounces, config.restitution)
                });
            }

            return samples;
        },

        bounceOut: function (t, bounces, restitution) {
            if (t <= 0) return 0;
            if (t >= 1) return 1;

            const safeRestitution = clamp(restitution, 0.1, 0.99);
            const bounceCount = Math.max(1, Math.floor(bounces));
            const heights = [1];
            const rawDurations = [1];

            for (let i = 0; i < bounceCount; i++) {
                heights.push(heights[i] * safeRestitution * safeRestitution);
            }

            for (let i = 1; i <= bounceCount; i++) {
                rawDurations.push(2 * Math.sqrt(heights[i]));
            }

            const totalDuration = rawDurations.reduce(function (sum, duration) {
                return sum + duration;
            }, 0);

            const durations = rawDurations.map(function (duration) {
                return duration / totalDuration;
            });

            let accumulated = 0;
            for (let i = 0; i <= bounceCount; i++) {
                const start = accumulated;
                const end = accumulated + durations[i];

                if (t <= end || i === bounceCount) {
                    if (i === 0) {
                        const localT = t / durations[0];
                        return localT * localT;
                    }
                    const localT = (t - start) / durations[i];
                    const parabola = 1 - Math.pow(2 * localT - 1, 2);
                    return 1 - heights[i] * parabola;
                }

                accumulated = end;
            }

            return 1;
        },

        expression: function (params) {
            return (
                "if(thisProperty.numKeys<2){value}else{\n" +
                "var seg=1;\n" +
                "while(seg<thisProperty.numKeys-1&&key(seg+1).time<=time)seg++;\n" +
                "var t0=key(seg).time,t1=key(seg+1).time;\n" +
                "var v0=key(seg).value,v1=key(seg+1).value;\n" +
                "if(time<=t0){v0}else if(time>=t1){v1}else{\n" +
                "var t=(time-t0)/(t1-t0);\n" +
                "var r=Math.max(0.1,Math.min(0.99," + params.restitution.toFixed(4) + "));\n" +
                "var n=Math.max(1,Math.floor(" + Math.floor(params.bounces) + "));\n" +
                "var h=[1]; for(var i=0;i<n;i++) h.push(h[i]*r*r);\n" +
                "var rawDur=[1]; for(var i=1;i<=n;i++) rawDur.push(2*Math.sqrt(h[i]));\n" +
                "var tot=0; for(var i=0;i<rawDur.length;i++) tot+=rawDur[i];\n" +
                "var durs=[]; for(var i=0;i<rawDur.length;i++) durs.push(rawDur[i]/tot);\n" +
                "var ease=1; var cum=0;\n" +
                "for(var i=0;i<=n;i++){\n" +
                "  var s=cum, e=cum+durs[i];\n" +
                "  if(t<=e||i===n){\n" +
                "    if(i===0){ var lt=t/durs[0]; ease=lt*lt; }\n" +
                "    else { var lt=(t-s)/durs[i]; var p=1-Math.pow(2*lt-1,2); ease=1-h[i]*p; }\n" +
                "    break;\n" +
                "  }\n" +
                "  cum=e;\n" +
                "}\n" +
                "if(v0.length){var rv=[];for(var j=0;j<v0.length;j++)rv.push(v0[j]+(v1[j]-v0[j])*ease);rv}else{v0+(v1-v0)*ease}}}"
            );
        }
    };

    arkaGraphEngine.Bounce = arkaGraphEngine.register(Bounce.key, Bounce);

})(window);