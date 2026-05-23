(function () {
    'use strict';
    const AG = window.AG;

    function getSamples(sampleCount) {
        const engine = window.ArkaGraphEngine;
        const state = AG.state;
        if (state.engine === 'bezier' && state.params.bezier.mode === 'speed') {
            return engine.get('bezier').speedSample(sampleCount || 80, state.params.bezier);
        }
        return engine.sample(state.engine, state.params[state.engine], sampleCount || 80);
    }

    function getSnapshotSamples(snapshot, sampleCount) {
        if (!snapshot) return [];
        const engine = window.ArkaGraphEngine;
        if (snapshot.engine === 'bezier' && snapshot.params.mode === 'speed') {
            return engine.get('bezier').speedSample(sampleCount || 80, snapshot.params);
        }
        return engine.sample(snapshot.engine, snapshot.params, sampleCount || 80);
    }

    function buildCurrentExpression() {
        const engine = window.ArkaGraphEngine;
        const looping = window.ArkaGraphLooping;
        const state = AG.state;
        const baseExpr = state.engine === 'bezier'
            ? engine.get('bezier').expression(state.params.bezier)
            : engine.expression(state.engine, state.params[state.engine]);
        if (!AG.isLoopActive() || !looping) return baseExpr;
        return looping.wrapExpression(baseExpr, state.loop);
    }

    AG.getSamples = getSamples;
    AG.getSnapshotSamples = getSnapshotSamples;
    AG.buildCurrentExpression = buildCurrentExpression;
})();