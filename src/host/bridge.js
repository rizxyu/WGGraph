(function () {
    'use strict';
    const AG = window.AG;

    function evalHostScript(methodName) {
        const args = Array.prototype.slice.call(arguments, 1);
        return new Promise(function (resolve) {
            if (!AG.csInterface) { resolve('PREVIEW_MODE'); return; }
            const call = methodName + '(' + args.map(function (a) { return JSON.stringify(a); }).join(',') + ')';
            AG.csInterface.evalScript(call, resolve);
        });
    }

    async function applyToSelected() {
        AG.setStatus('APPLYING...', '');
        if (AG.state.engine === 'bezier' && !AG.isLoopActive()) {
            const bz = AG.state.params.bezier;
            const result = await evalHostScript(AG.hostMethods.applyNativeEase, bz.x1, bz.y1, bz.x2, bz.y2);
            if (result === 'OK') AG.captureReferenceCurve();
            AG.setStatus(result === 'OK' ? 'NATIVE EASE APPLIED ✓' : 'ERROR', result === 'OK' ? 'ok' : 'err');
            return;
        }
        const expr = AG.buildCurrentExpression();
        const result = await evalHostScript(AG.hostMethods.applyExpression, expr);
        const ok = result && result.indexOf('OK') === 0;
        if (ok) AG.captureReferenceCurve();
        AG.setStatus(ok ? (AG.isLoopActive() ? 'LOOP EXPRESSION APPLIED ✓' : 'EXPRESSION APPLIED ✓') : 'ERROR', ok ? 'ok' : 'err');
    }

    async function bakeKeys() {
        AG.setStatus('BAKING KEYS...', '');
        const baked = AG.getSamples(120);
        const result = await evalHostScript(AG.hostMethods.bakeKeys, JSON.stringify(baked), JSON.stringify({ requestedSteps: AG.state.bakeSteps }));
        const ok = result && result.indexOf('OK') === 0;
        if (ok) AG.captureReferenceCurve();
        AG.setStatus(ok ? result.replace(/^OK:\s*/, '').toUpperCase() + ' ✓' : 'ERROR', ok ? 'ok' : 'err');
    }

    async function clearExpression() {
        await evalHostScript(AG.hostMethods.clearExpression);
        AG.setStatus('EXPR CLEARED ✓', 'ok');
    }

    async function syncFromAfterEffects() {
        AG.setStatus('READING AE...', '');
        const result = await evalHostScript(AG.hostMethods.syncFromAE);
        if (!result || result === 'null' || result === 'PREVIEW_MODE') {
            AG.setStatus('NO KEYS SELECTED', 'err');
            return;
        }
        try {
            const data = JSON.parse(result);
            const currentMode = AG.state.params.bezier.mode || 'value';
            AG.state.params.bezier = { x1: data.x1, y1: data.y1, x2: data.x2, y2: data.y2, mode: currentMode };
            AG.setEngine('bezier');
            if (AG.presetManager) { AG.presetManager.setEngine('bezier'); AG.presetManager.clearActivePreset(); }
            AG.syncCurrentInputs();
            AG.draw();
            AG.setStatus('SYNCED ✓', 'ok');
        } catch (e) {
            AG.setStatus('PARSE ERROR', 'err');
        }
    }

    async function refreshFps() {
        const fps = await evalHostScript(AG.hostMethods.getFPS);
        if (fps && !isNaN(fps)) AG.dom.fps.textContent = fps + ' FPS';
    }

    AG.evalHostScript = evalHostScript;
    AG.applyToSelected = applyToSelected;
    AG.bakeKeys = bakeKeys;
    AG.clearExpression = clearExpression;
    AG.syncFromAfterEffects = syncFromAfterEffects;
    AG.refreshFps = refreshFps;
})();