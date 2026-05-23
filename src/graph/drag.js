(function () {
    'use strict';
    const AG = window.AG;

    function updateDraggedState(normalized) {
        const params = AG.state.params;
        const dragging = AG.state.dragging;

        if (dragging.type === 'bezier') {
            const nextX = Math.max(0.001, Math.min(0.999, normalized.t));
            if (params.bezier.mode === 'speed') {
                let nextV = normalized.v;
                if (AG.state.dragStartV !== undefined && Math.abs(nextV - AG.state.dragStartV) < 0.15 / AG.scaleY) nextV = AG.state.dragStartV;
                if (Math.abs(nextV) < 0.05 / AG.scaleY) nextV = 0;
                AG.state.guidelineY = nextV;
                const nextSpeed = nextV * 3.5;
                if (dragging.index === 0) { params.bezier.x1 = nextX; params.bezier.y1 = nextSpeed * nextX; }
                else { params.bezier.x2 = nextX; params.bezier.y2 = 1 - nextSpeed * (1 - nextX); }
            } else if (dragging.index === 0) {
                params.bezier.x1 = nextX; params.bezier.y1 = normalized.v;
            } else {
                params.bezier.x2 = nextX; params.bezier.y2 = normalized.v;
            }
            AG.inputSyncMap.bezier();
            return;
        }
        if (dragging.type === 'custom') {
            const anchor = params.custom.anchors[dragging.index];
            if (anchor.t !== 0 && anchor.t !== 1) anchor.t = Math.max(0.01, Math.min(0.99, normalized.t));
            anchor.v = normalized.v;
            return;
        }
        if (dragging.type === 'elastic-node') {
            params.elastic.frequency = Math.max(1, Math.min(10, normalized.t * 10));
            params.elastic.amplitude = Math.max(1, Math.min(3, normalized.v * 3));
            AG.inputSyncMap.elastic(); return;
        }
        if (dragging.type === 'bounce-node') {
            params.bounce.bounces = Math.max(1, Math.min(8, Math.round(normalized.t * 8)));
            params.bounce.restitution = Math.max(0.1, Math.min(0.95, normalized.v));
            AG.inputSyncMap.bounce(); return;
        }
        if (dragging.type === 'wave-node') {
            params.wave.frequency = Math.max(0.5, Math.min(20, normalized.t * 20));
            params.wave.amplitude = Math.max(0.1, Math.min(3, normalized.v * 3));
            AG.inputSyncMap.wave(); return;
        }
        if (dragging.type === 'steps-node') {
            params.steps.count = Math.max(1, Math.min(32, Math.round(normalized.t * 31 + 1)));
            AG.inputSyncMap.steps();
        }
    }

    AG.updateDraggedState = updateDraggedState;
})();