(function () {
    'use strict';
    const AG = window.AG;

    function getCanvasPointer(event) {
        const rect = AG.dom.canvas.getBoundingClientRect();
        const ratio = AG.dpr();
        return {
            rect: rect,
            x: (event.clientX - rect.left) * ratio,
            y: (event.clientY - rect.top) * ratio
        };
    }

    function hitTest(x, y) {
        const r2 = (14 * AG.dpr()) * (14 * AG.dpr());
        const params = AG.state.params;
        function dist2(pt) { const dx = x - pt.x, dy = y - pt.y; return dx * dx + dy * dy; }

        if (AG.state.engine === 'bezier') {
            const pts = params.bezier.mode === 'speed'
                ? [AG.toCanvas(params.bezier.x1, AG.getBezierSpeeds(params.bezier).s1), AG.toCanvas(params.bezier.x2, AG.getBezierSpeeds(params.bezier).s2)]
                : [AG.toCanvas(params.bezier.x1, params.bezier.y1), AG.toCanvas(params.bezier.x2, params.bezier.y2)];
            for (let i = 0; i < pts.length; i++) {
                if (dist2(pts[i]) < r2) return { type: 'bezier', index: i };
            }
        }
        if (AG.state.engine === 'custom') {
            for (let i = 0; i < params.custom.anchors.length; i++) {
                if (dist2(AG.toCanvas(params.custom.anchors[i].t, params.custom.anchors[i].v)) < r2) return { type: 'custom', index: i };
            }
        }
        if (AG.state.engine === 'elastic' && dist2(AG.toCanvas(params.elastic.frequency / 10, params.elastic.amplitude / 3)) < r2) return { type: 'elastic-node' };
        if (AG.state.engine === 'bounce' && dist2(AG.toCanvas(params.bounce.bounces / 8, params.bounce.restitution)) < r2) return { type: 'bounce-node' };
        if (AG.state.engine === 'wave' && dist2(AG.toCanvas(params.wave.frequency / 20, params.wave.amplitude / 3)) < r2) return { type: 'wave-node' };
        if (AG.state.engine === 'steps' && dist2(AG.toCanvas((params.steps.count - 1) / 31, 0.5)) < r2) return { type: 'steps-node' };
        return null;
    }

    AG.getCanvasPointer = getCanvasPointer;
    AG.hitTest = hitTest;
})();