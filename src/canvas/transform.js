(function () {
    'use strict';
    const AG = window.AG;

    function toCanvas(t, v) {
        const canvas = AG.dom.canvas;
        const padding = 24 * AG.dpr();
        const w = canvas.width, h = canvas.height;
        const innerH = h - padding * 2;
        const x = padding + t * (w - padding * 2);
        if (AG.state.engine === 'bezier' && AG.state.params.bezier.mode === 'speed') {
            return { x: x, y: h - padding - v * innerH * AG.scaleY };
        }
        const centerY = h - padding - 0.5 * innerH;
        return { x: x, y: centerY - (v - 0.5) * innerH * AG.scaleY };
    }

    function fromCanvas(x, y) {
        const canvas = AG.dom.canvas;
        const padding = 24 * AG.dpr();
        const w = canvas.width, h = canvas.height;
        const innerH = h - padding * 2;
        const t = Math.max(0, Math.min(1, (x - padding) / (w - padding * 2)));
        if (AG.state.engine === 'bezier' && AG.state.params.bezier.mode === 'speed') {
            return { t: t, v: (h - padding - y) / (innerH * AG.scaleY) };
        }
        const centerY = h - padding - 0.5 * innerH;
        return { t: t, v: 0.5 + (centerY - y) / (innerH * AG.scaleY) };
    }

    AG.toCanvas = toCanvas;
    AG.fromCanvas = fromCanvas;
})();