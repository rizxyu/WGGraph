(function () {
    'use strict';
    const AG = window.AG;

    function getBezierSpeeds(params) {
        const ex1 = Math.max(0.0001, params.x1);
        const ex2 = Math.max(0.0001, 1 - params.x2);
        return { s1: (params.y1 / ex1) / 3.5, s2: ((1 - params.y2) / ex2) / 3.5 };
    }

    function drawNode(point, radius, fill) {
        const ctx = AG.ctx;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius * AG.dpr(), 0, 7);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = AG.cssVar('--bg0', '#090909');
        ctx.lineWidth = 1.5 * AG.dpr();
        ctx.stroke();
    }

    function drawGrid(padding, width, height) {
        const ctx = AG.ctx;
        const isSpeed = AG.state.engine === 'bezier' && AG.state.params.bezier.mode === 'speed';
        ctx.strokeStyle = AG.cssVar('--grid-line', '#1e1e1e');
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const x = padding + i * (width - padding * 2) / 4;
            const y = padding + i * (height - padding * 2) / 4;
            ctx.beginPath(); ctx.moveTo(x, padding); ctx.lineTo(x, height - padding); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(width - padding, y); ctx.stroke();
        }
        if (!isSpeed) {
            ctx.strokeStyle = AG.cssVar('--grid-diagonal', '#222222');
            ctx.setLineDash([4 * AG.dpr(), 4 * AG.dpr()]);
            ctx.beginPath();
            ctx.moveTo(AG.toCanvas(0, 0).x, AG.toCanvas(0, 0).y);
            ctx.lineTo(AG.toCanvas(1, 1).x, AG.toCanvas(1, 1).y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.strokeStyle = AG.cssVar('--grid-border', '#252525');
        ctx.strokeRect(padding - 0.5, padding - 0.5, width - padding * 2 + 1, height - padding * 2 + 1);
        if (isSpeed) {
            const zp = AG.toCanvas(0, 0);
            ctx.strokeStyle = AG.cssVar('--ghost-line', 'rgba(255,255,255,0.22)');
            ctx.lineWidth = 2 * AG.dpr();
            ctx.beginPath(); ctx.moveTo(padding, zp.y); ctx.lineTo(width - padding, zp.y); ctx.stroke();
        }
    }

    function drawSamples(samples, padding, height, width) {
        if (!samples.length) return;
        const ctx = AG.ctx;
        const isSpeed = AG.state.engine === 'bezier' && AG.state.params.bezier.mode === 'speed';
        if (!isSpeed) {
            const maxV = Math.max.apply(null, samples.map(function (s) { return s.v; }));
            const minV = Math.min.apply(null, samples.map(function (s) { return s.v; }));
            if (maxV > 1 || minV < 0) {
                ctx.fillStyle = AG.cssVar('--graph-fill', 'rgba(0, 196, 167, 0.07)');
                ctx.fillRect(padding, 0, width - padding * 2, padding);
                if (minV < 0) ctx.fillRect(padding, height - padding, width - padding * 2, padding);
            }
        }
        ctx.beginPath();
        ctx.moveTo(AG.toCanvas(samples[0].t, samples[0].v).x, AG.toCanvas(samples[0].t, samples[0].v).y);
        for (let i = 1; i < samples.length; i++) {
            ctx.lineTo(AG.toCanvas(samples[i].t, samples[i].v).x, AG.toCanvas(samples[i].t, samples[i].v).y);
        }
        if (isSpeed) {
            ctx.lineTo(AG.toCanvas(samples[samples.length - 1].t, 0).x, AG.toCanvas(samples[samples.length - 1].t, 0).y);
            ctx.lineTo(AG.toCanvas(samples[0].t, 0).x, AG.toCanvas(samples[0].t, 0).y);
        } else {
            ctx.lineTo(AG.toCanvas(samples[samples.length - 1].t, 0).x, height - padding);
            ctx.lineTo(AG.toCanvas(samples[0].t, 0).x, height - padding);
        }
        ctx.fillStyle = AG.cssVar('--graph-fill', 'rgba(0, 196, 167, 0.07)');
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(AG.toCanvas(samples[0].t, samples[0].v).x, AG.toCanvas(samples[0].t, samples[0].v).y);
        for (let i = 1; i < samples.length; i++) {
            ctx.lineTo(AG.toCanvas(samples[i].t, samples[i].v).x, AG.toCanvas(samples[i].t, samples[i].v).y);
        }
        ctx.strokeStyle = AG.cssVar('--graph-line', '#00c4a7');
        ctx.lineWidth = 2 * AG.dpr();
        ctx.stroke();
    }

    function drawReferenceCurve(samples, padding, height) {
        if (!samples.length) return;
        const ctx = AG.ctx;
        const isSpeed = AG.state.engine === 'bezier' && AG.state.params.bezier.mode === 'speed';
        ctx.beginPath();
        ctx.moveTo(AG.toCanvas(samples[0].t, samples[0].v).x, AG.toCanvas(samples[0].t, samples[0].v).y);
        for (let i = 1; i < samples.length; i++) {
            ctx.lineTo(AG.toCanvas(samples[i].t, samples[i].v).x, AG.toCanvas(samples[i].t, samples[i].v).y);
        }
        ctx.strokeStyle = AG.cssVar('--ghost-line', 'rgba(255,255,255,0.22)');
        ctx.lineWidth = 1.5 * AG.dpr();
        ctx.setLineDash([6 * AG.dpr(), 4 * AG.dpr()]);
        ctx.stroke();
        ctx.setLineDash([]);
        if (!isSpeed) {
            ctx.beginPath();
            ctx.moveTo(AG.toCanvas(samples[0].t, samples[0].v).x, AG.toCanvas(samples[0].t, samples[0].v).y);
            for (let i = 1; i < samples.length; i++) {
                ctx.lineTo(AG.toCanvas(samples[i].t, samples[i].v).x, AG.toCanvas(samples[i].t, samples[i].v).y);
            }
            ctx.lineTo(AG.toCanvas(samples[samples.length - 1].t, 0).x, height - padding);
            ctx.lineTo(AG.toCanvas(samples[0].t, 0).x, height - padding);
            ctx.fillStyle = AG.cssVar('--ghost-fill', 'rgba(255,255,255,0.04)');
            ctx.fill();
        }
    }

    function drawBezierHandles() {
        const ctx = AG.ctx;
        const bezier = AG.state.params.bezier;
        const ratio = AG.dpr();
        if (bezier.mode === 'speed') {
            if (AG.state.guidelineY !== undefined) {
                const guideY = AG.toCanvas(0, AG.state.guidelineY).y;
                ctx.strokeStyle = AG.cssVar('--guide-line', 'rgba(245, 200, 66, 0.4)');
                ctx.lineWidth = 1;
                ctx.setLineDash([4 * ratio, 4 * ratio]);
                ctx.beginPath(); ctx.moveTo(0, guideY); ctx.lineTo(AG.dom.canvas.width, guideY); ctx.stroke();
                ctx.setLineDash([]);
            }
            const speeds = getBezierSpeeds(bezier);
            const base1 = AG.toCanvas(0, speeds.s1), handle1 = AG.toCanvas(bezier.x1, speeds.s1);
            const base2 = AG.toCanvas(1, speeds.s2), handle2 = AG.toCanvas(bezier.x2, speeds.s2);
            ctx.strokeStyle = AG.cssVar('--grid-border', '#252525');
            ctx.lineWidth = 1.5 * ratio;
            ctx.beginPath(); ctx.moveTo(base1.x, base1.y); ctx.lineTo(handle1.x, handle1.y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(base2.x, base2.y); ctx.lineTo(handle2.x, handle2.y); ctx.stroke();
            drawNode(base1, 4, AG.cssVar('--node-muted', '#555555'));
            drawNode(base2, 4, AG.cssVar('--node-muted', '#555555'));
            drawNode(handle1, 5, AG.cssVar('--node-primary', '#f5c842'));
            drawNode(handle2, 5, AG.cssVar('--node-secondary', '#00c4a7'));
            return;
        }
        const p0 = AG.toCanvas(0, 0), p3 = AG.toCanvas(1, 1);
        const p1 = AG.toCanvas(bezier.x1, bezier.y1), p2 = AG.toCanvas(bezier.x2, bezier.y2);
        ctx.strokeStyle = AG.cssVar('--grid-border', '#252525');
        ctx.lineWidth = 1.5 * ratio;
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(p3.x, p3.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        drawNode(p1, 5, AG.cssVar('--node-primary', '#f5c842'));
        drawNode(p2, 5, AG.cssVar('--node-secondary', '#00c4a7'));
    }

    function drawCustomAnchors() {
        AG.state.params.custom.anchors.forEach(function (anchor) {
            drawNode(AG.toCanvas(anchor.t, anchor.v), 5, AG.cssVar('--node-secondary', '#00c4a7'));
        });
    }

    function drawEngineControlNode() {
        const state = AG.state;
        let point = null;
        if (state.engine === 'elastic') point = AG.toCanvas(state.params.elastic.frequency / 10, state.params.elastic.amplitude / 3);
        else if (state.engine === 'bounce') point = AG.toCanvas(state.params.bounce.bounces / 8, state.params.bounce.restitution);
        else if (state.engine === 'wave') point = AG.toCanvas(state.params.wave.frequency / 20, state.params.wave.amplitude / 3);
        else if (state.engine === 'steps') point = AG.toCanvas((state.params.steps.count - 1) / 31, 0.5);
        if (point) drawNode(point, 6, AG.cssVar('--node-primary', '#f5c842'));
    }

    function draw() {
        const canvas = AG.dom.canvas;
        const ctx = AG.ctx;
        const w = canvas.width, h = canvas.height;
        const padding = 24 * AG.dpr();
        const samples = AG.getSamples(80);
        const refSamples = AG.state.referenceCurve ? AG.getSnapshotSamples(AG.state.referenceCurve, 80) : [];
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = AG.cssVar('--canvas-bg', '#111111');
        ctx.fillRect(0, 0, w, h);
        drawGrid(padding, w, h);
        if (AG.isGhostEnabled() && refSamples.length) {
            ctx.save();
            drawReferenceCurve(refSamples, padding, h);
            ctx.restore();
        }
        drawSamples(samples, padding, h, w);
        if (AG.state.engine === 'bezier') drawBezierHandles();
        else if (AG.state.engine === 'custom') drawCustomAnchors();
        else drawEngineControlNode();
    }

    function resizeCanvas() {
        const rect = AG.dom.canvasContainer.getBoundingClientRect();
        const ratio = AG.dpr();
        AG.dom.canvas.width = Math.round(rect.width * ratio);
        AG.dom.canvas.height = Math.round(rect.height * ratio);
        AG.dom.canvas.style.width = rect.width + 'px';
        AG.dom.canvas.style.height = rect.height + 'px';
        draw();
    }

    AG.getBezierSpeeds = getBezierSpeeds;
    AG.draw = draw;
    AG.resizeCanvas = resizeCanvas;
})();