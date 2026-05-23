(function () {
    'use strict';
    const AG = window.AG;

    function bindUiEvents() {
        document.querySelectorAll('.eng-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                AG.setEngine(tab.dataset.engine);
                if (AG.presetManager) {
                    AG.presetManager.setEngine(tab.dataset.engine);
                    AG.presetManager.clearActivePreset();
                }
            });
        });

        document.querySelectorAll('#bezier-mode .seg-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                AG.state.params.bezier.mode = btn.dataset.bmode;
                AG.syncBezierModeButtons();
                AG.notifyPresetDirty();
                AG.draw();
            });
        });

        AG.dom.applyButton.addEventListener('click', AG.applyToSelected);
        AG.dom.bakeButton.addEventListener('click', AG.bakeKeys);
        AG.dom.clearButton.addEventListener('click', AG.clearExpression);
        AG.dom.resetButton.addEventListener('click', AG.resetCurrentEngine);
        AG.dom.syncButton.addEventListener('click', AG.syncFromAfterEffects);
        AG.dom.mirrorButton.addEventListener('click', AG.mirrorCurrentGraph);

        AG.dom.loopEnabled.addEventListener('change', function (event) {
            AG.state.loop.enabled = !!event.target.checked;
            AG.syncLoopInputs();
            AG.refreshApplyButton();
        });

        AG.dom.loopInfinite.addEventListener('change', function (event) {
            AG.state.loop.infinite = !!event.target.checked;
            AG.syncLoopInputs();
            AG.refreshApplyButton();
        });

        [AG.dom.loopInCount, AG.dom.loopOutCount].forEach(function (input) {
            function sync() {
                AG.state.loop.inCount = AG.clampLoopCount(AG.dom.loopInCount.value);
                AG.state.loop.outCount = AG.clampLoopCount(AG.dom.loopOutCount.value);
                AG.syncLoopInputs();
                AG.refreshApplyButton();
            }
            input.addEventListener('input', sync);
            input.addEventListener('change', sync);
        });
    }

    AG.bindUiEvents = bindUiEvents;
})();