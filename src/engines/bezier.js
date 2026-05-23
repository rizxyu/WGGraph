(function (root) {
    'use strict';

    const arkaGraphEngine = root.ArkaGraphEngine;
    const clamp = arkaGraphEngine.clamp;

    const Bezier = {
        key: 'bezier',
        defaults: { x1: 0.42, y1: 0.0, x2: 0.58, y2: 1.0, mode: 'value' },
        solve: function (t, x1, y1, x2, y2) {
            if (t <= 0) return 0;
            if (t >= 1) return 1;

            let tParam = t;
            for (let i = 0; i < 8; i++) {
                const fx = 3 * x1 * tParam * (1 - tParam) * (1 - tParam) + 3 * x2 * tParam * tParam * (1 - tParam) + tParam * tParam * tParam - t;
                const dfx = 3 * (1 - tParam) * (1 - tParam) * x1 + 6 * (1 - tParam) * tParam * (x2 - x1) + 3 * tParam * tParam * (1 - x2);
                if (Math.abs(dfx) < 1e-9) {
                    break;
                }
                tParam = clamp(tParam - fx / dfx, 0, 1);
            }

            return 3 * y1 * tParam * (1 - tParam) * (1 - tParam) + 3 * y2 * tParam * tParam * (1 - tParam) + tParam * tParam * tParam;
        },
        sample: function (steps, params) {
            const config = params || this.defaults;
            const samples = [];

            for (let i = 0; i < steps; i++) {
                const t = i / (steps - 1);
                samples.push({
                    t: t,
                    v: this.solve(t, config.x1, config.y1, config.x2, config.y2)
                });
            }

            return samples;
        },
        expression: function (params) {
            return (
                "var x1=" + params.x1.toFixed(4) + ",y1=" + params.y1.toFixed(4) + ",x2=" + params.x2.toFixed(4) + ",y2=" + params.y2.toFixed(4) + ";\n" +
                "if(thisProperty.numKeys<2){value}else{\n" +
                "var seg=1;\n" +
                "while(seg<thisProperty.numKeys-1&&key(seg+1).time<=time)seg++;\n" +
                "var t0=key(seg).time,t1=key(seg+1).time;\n" +
                "var v0=key(seg).value,v1=key(seg+1).value;\n" +
                "if(time<=t0){v0}else if(time>=t1){v1}else{\n" +
                "var t=(time-t0)/(t1-t0); var tp=t;\n" +
                "for(var i=0;i<8;i++){\n" +
                "var omt=1-tp;\n" +
                "var fx=3*x1*tp*omt*omt+3*x2*tp*tp*omt+tp*tp*tp-t;\n" +
                "var dfx=3*omt*omt*x1+6*omt*tp*(x2-x1)+3*tp*tp*(1-x2);\n" +
                "if(Math.abs(dfx)<0.000000001)break;\n" +
                "tp=Math.max(0,Math.min(1,tp-(fx/dfx)));\n" +
                "}\n" +
                "var omt2=1-tp;\n" +
                "var ease=3*y1*tp*omt2*omt2+3*y2*tp*tp*omt2+tp*tp*tp;\n" +
                "if(v0.length){var r=[];for(var j=0;j<v0.length;j++)r.push(v0[j]+(v1[j]-v0[j])*ease);r}else{v0+(v1-v0)*ease}}}"
            );
        },
        speedSample: function (steps, params) {
            const config = params || this.defaults;
            const samples = [];

            for (let i = 0; i < steps; i++) {
                const t = i / (steps - 1);
                const bx = 3 * (1 - t) * (1 - t) * t * config.x1 + 3 * (1 - t) * t * t * config.x2 + t * t * t;
                const dx = 3 * (1 - t) * (1 - t) * config.x1 + 6 * (1 - t) * t * (config.x2 - config.x1) + 3 * t * t * (1 - config.x2);
                const dy = 3 * (1 - t) * (1 - t) * config.y1 + 6 * (1 - t) * t * (config.y2 - config.y1) + 3 * t * t * (1 - config.y2);
                let speed = (dx === 0) ? ((dy > 0) ? 10 : -10) : (dy / dx);
                const visualSpeed = speed / 3.5;
                samples.push({ t: bx, v: visualSpeed });
            }

            return samples;
        }
    };

    arkaGraphEngine.Bezier = arkaGraphEngine.register(Bezier.key, Bezier);
})(window);
