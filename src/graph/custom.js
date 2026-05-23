(function () {
    'use strict';
    const AG = window.AG;

    function createCustomAnchorsFromSamples(samples, anchorCount) {
        const total = anchorCount || 9;
        function sampleAt(targetT) {
            for (let i = 1; i < samples.length; i++) {
                if (samples[i].t >= targetT) {
                    const prev = samples[i - 1], next = samples[i];
                    const span = next.t - prev.t || 1;
                    return prev.v + (next.v - prev.v) * ((targetT - prev.t) / span);
                }
            }
            return samples[samples.length - 1].v;
        }
        const anchors = [];
        for (let i = 0; i < total; i++) {
            const t = i / (total - 1);
            anchors.push({ t: t, v: sampleAt(t) });
        }
        return anchors;
    }

    function addCustomAnchor(pointer) {
        const normalized = AG.fromCanvas(pointer.x, pointer.y);
        if (normalized.t <= 0.02 || normalized.t >= 0.98) return;
        AG.state.params.custom.anchors.push({ t: normalized.t, v: normalized.v });
        AG.state.params.custom.anchors.sort(function (a, b) { return a.t - b.t; });
        AG.dom.customAnchorCount.textContent = String(AG.state.params.custom.anchors.length);
        AG.notifyPresetDirty();
        AG.draw();
    }

    function removeCustomAnchor(pointer) {
        const anchors = AG.state.params.custom.anchors;
        const ratio = AG.dpr();
        for (let i = anchors.length - 1; i >= 0; i--) {
            if (anchors[i].t === 0 || anchors[i].t === 1) continue;
            const pt = AG.toCanvas(anchors[i].t, anchors[i].v);
            const dx = pointer.x - pt.x, dy = pointer.y - pt.y;
            if (dx * dx + dy * dy < 144 * ratio * ratio) {
                anchors.splice(i, 1);
                AG.dom.customAnchorCount.textContent = String(anchors.length);
                AG.notifyPresetDirty();
                AG.draw();
                return;
            }
        }
    }

    AG.createCustomAnchorsFromSamples = createCustomAnchorsFromSamples;
    AG.addCustomAnchor = addCustomAnchor;
    AG.removeCustomAnchor = removeCustomAnchor;
})();