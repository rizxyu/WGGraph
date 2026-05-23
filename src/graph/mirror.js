(function () {
    'use strict';
    const AG = window.AG;

    function createMirroredSnapshot(snapshot) {
        if (snapshot.engine === 'bezier') {
            return {
                engine: 'bezier',
                params: {
                    x1: 1 - snapshot.params.x2, y1: 1 - snapshot.params.y2,
                    x2: 1 - snapshot.params.x1, y2: 1 - snapshot.params.y1,
                    mode: snapshot.params.mode || 'value'
                }
            };
        }
        if (snapshot.engine === 'custom') {
            return {
                engine: 'custom',
                params: {
                    anchors: snapshot.params.anchors
                        .map(function (a) { return { t: 1 - a.t, v: 1 - a.v }; })
                        .sort(function (a, b) { return a.t - b.t; })
                }
            };
        }
        const sourceSamples = AG.getSnapshotSamples(snapshot, 80);
        const mirroredSamples = sourceSamples.slice().reverse()
            .map(function (s) { return { t: 1 - s.t, v: 1 - s.v }; })
            .sort(function (a, b) { return a.t - b.t; });
        return { engine: 'custom', params: { anchors: AG.createCustomAnchorsFromSamples(mirroredSamples, 9) } };
    }

    function mirrorCurrentGraph() {
        const mirrored = createMirroredSnapshot(AG.getCurrentSnapshot());
        AG.applyPresetState({ engine: mirrored.engine, params: mirrored.params });
        AG.notifyPresetDirty();
        if (AG.presetManager) AG.presetManager.setEngine(AG.state.engine);
        AG.setStatus(mirrored.engine === 'custom' ? 'MIRRORED AS CUSTOM ✓' : 'GRAPH MIRRORED ✓', 'ok');
    }

    AG.createMirroredSnapshot = createMirroredSnapshot;
    AG.mirrorCurrentGraph = mirrorCurrentGraph;
})();