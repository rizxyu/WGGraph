(function (root) {

    'use strict';

    const arkaGraphEngine = root.ArkaGraphEngine;
    const clamp = arkaGraphEngine.clamp;

    const Custom = {

        key: 'custom',

        defaults: {
            anchors: [
                { t: 0,    v: 0    },
                { t: 0.25, v: 0.35 },
                { t: 0.5,  v: 0.65 },
                { t: 0.75, v: 0.85 },
                { t: 1,    v: 1    }
            ]
        },

        sample: function (steps, params) {
            const config = params || this.defaults;
            const points = config.anchors.slice().sort(function (left, right) {
                return left.t - right.t;
            });
            const samples = [];

            if (points[0].t > 0) {
                points.unshift({ t: 0, v: points[0].v });
            }
            if (points[points.length - 1].t < 1) {
                points.push({ t: 1, v: points[points.length - 1].v });
            }

            for (let i = 0; i < steps; i++) {
                const t = i / (steps - 1);
                samples.push({
                    t: t,
                    v: clamp(this.hermite(points, t), 0, 1.2)
                });
            }

            return samples;
        },

        hermite: function (points, t) {
            if (points.length < 2) { return t; }

            let index = 0;
            while (index < points.length - 2 && points[index + 1].t <= t) {
                index++;
            }

            const p0 = points[index];
            const p1 = points[index + 1];

            if (p0.t === p1.t) { return p0.v; }

            const x = (t - p0.t) / (p1.t - p0.t);
            let m0 = 0;
            let m1 = 0;

            if (index > 0) {
                m0 = (p1.v - points[index - 1].v) / (p1.t - points[index - 1].t);
            } else {
                m0 = (p1.v - p0.v) / (p1.t - p0.t);
            }

            if (index < points.length - 2) {
                m1 = (points[index + 2].v - p0.v) / (points[index + 2].t - p0.t);
            } else {
                m1 = (p1.v - p0.v) / (p1.t - p0.t);
            }

            const deltaX = p1.t - p0.t;
            m0 *= deltaX;
            m1 *= deltaX;

            return (2 * x * x * x - 3 * x * x + 1) * p0.v +
                   (x * x * x - 2 * x * x + x) * m0 +
                   (-2 * x * x * x + 3 * x * x) * p1.v +
                   (x * x * x - x * x) * m1;
        },

        expression: function (params) {
            const sorted = params.anchors.slice().sort(function (left, right) {
                return left.t - right.t;
            });
            const times  = JSON.stringify(sorted.map(function (p) { return +p.t.toFixed(4); }));
            const values = JSON.stringify(sorted.map(function (p) { return +p.v.toFixed(4); }));

            return (
                "var aT=" + times + ",aV=" + values + ";\n" +
                "if(thisProperty.numKeys<2){value}else{\n" +
                "var seg=1;\n" +
                "while(seg<thisProperty.numKeys-1&&key(seg+1).time<=time)seg++;\n" +
                "var t0=key(seg).time,t1=key(seg+1).time;\n" +
                "var v0=key(seg).value,v1=key(seg+1).value;\n" +
                "if(time<=t0){v0}else if(time>=t1){v1}else{\n" +
                "var t=(time-t0)/(t1-t0);\n" +
                "var i=0;while(i<aT.length-2&&aT[i+1]<=t)i++;\n" +
                "var p0t=aT[i],p0v=aV[i],p1t=aT[i+1],p1v=aV[i+1];\n" +
                "var x=(t-p0t)/(p1t-p0t);\n" +
                "var m0=0,m1=0;\n" +
                "if(i>0)m0=(p1v-aV[i-1])/(p1t-aT[i-1]);else m0=(p1v-p0v)/(p1t-p0t);\n" +
                "if(i<aT.length-2)m1=(aV[i+2]-p0v)/(aT[i+2]-p0t);else m1=(p1v-p0v)/(p1t-p0t);\n" +
                "var dx=p1t-p0t; m0*=dx; m1*=dx;\n" +
                "var ease=(2*x*x*x-3*x*x+1)*p0v+(x*x*x-2*x*x+x)*m0+(-2*x*x*x+3*x*x)*p1v+(x*x*x-x*x)*m1;\n" +
                "if(v0.length){var r=[];for(var j=0;j<v0.length;j++)r.push(v0[j]+(v1[j]-v0[j])*ease);r}else{v0+(v1-v0)*ease}}}"
            );
        }
    };

    arkaGraphEngine.Custom = arkaGraphEngine.register(Custom.key, Custom);

})(window);