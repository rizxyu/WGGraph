(function () {
    'use strict';
    const AG = window.AG;

    AG.sliderBindings = {
        'bz-x1':     { digits: 2, update: function (v) { AG.state.params.bezier.x1 = v; } },
        'bz-y1':     { digits: 2, update: function (v) { AG.state.params.bezier.y1 = v; } },
        'bz-x2':     { digits: 2, update: function (v) { AG.state.params.bezier.x2 = v; } },
        'bz-y2':     { digits: 2, update: function (v) { AG.state.params.bezier.y2 = v; } },
        'el-amp':    { digits: 2, update: function (v) { AG.state.params.elastic.amplitude = v; } },
        'el-freq':   { digits: 1, update: function (v) { AG.state.params.elastic.frequency = v; } },
        'el-decay':  { digits: 1, update: function (v) { AG.state.params.elastic.decay = v; } },
        'bn-count':  { digits: 0, update: function (v) { AG.state.params.bounce.bounces = v; } },
        'bn-rest':   { digits: 2, update: function (v) { AG.state.params.bounce.restitution = v; } },
        'st-count':  { digits: 0, update: function (v) { AG.state.params.steps.count = v; } },
        'wv-amp':    { digits: 2, update: function (v) { AG.state.params.wave.amplitude = v; } },
        'wv-freq':   { digits: 1, update: function (v) { AG.state.params.wave.frequency = v; } },
        'wv-phase':  { digits: 2, update: function (v) { AG.state.params.wave.phase = v; } },
        'bake-steps':{ digits: 0, update: function (v) { AG.state.bakeSteps = v; } }
    };

    function setSliderValue(id, value) {
        document.getElementById(id).value = value;
        document.getElementById(id + '-val').textContent = Number(value).toFixed(AG.sliderBindings[id].digits);
    }

    function syncBezierModeButtons() {
        document.querySelectorAll('#bezier-mode .seg-btn').forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.bmode === AG.state.params.bezier.mode);
        });
    }

    AG.inputSyncMap = {
        bezier: function () {
            setSliderValue('bz-x1', AG.state.params.bezier.x1);
            setSliderValue('bz-y1', AG.state.params.bezier.y1);
            setSliderValue('bz-x2', AG.state.params.bezier.x2);
            setSliderValue('bz-y2', AG.state.params.bezier.y2);
            syncBezierModeButtons();
        },
        elastic: function () {
            setSliderValue('el-amp', AG.state.params.elastic.amplitude);
            setSliderValue('el-freq', AG.state.params.elastic.frequency);
            setSliderValue('el-decay', AG.state.params.elastic.decay);
        },
        bounce: function () {
            setSliderValue('bn-count', AG.state.params.bounce.bounces);
            setSliderValue('bn-rest', AG.state.params.bounce.restitution);
        },
        steps: function () { setSliderValue('st-count', AG.state.params.steps.count); },
        wave: function () {
            setSliderValue('wv-amp', AG.state.params.wave.amplitude);
            setSliderValue('wv-freq', AG.state.params.wave.frequency);
            setSliderValue('wv-phase', AG.state.params.wave.phase);
        },
        custom: function () {
            AG.dom.customAnchorCount.textContent = String(AG.state.params.custom.anchors.length);
        }
    };

    function syncCurrentInputs() {
        if (AG.inputSyncMap[AG.state.engine]) AG.inputSyncMap[AG.state.engine]();
    }

    function bindSliderEvents() {
        Object.keys(AG.sliderBindings).forEach(function (id) {
            document.getElementById(id).addEventListener('input', function (event) {
                const value = parseFloat(event.target.value);
                AG.sliderBindings[id].update(value);
                setSliderValue(id, value);
                if (id !== 'bake-steps') {
                    if (AG.state.engine === 'custom') {
                        AG.dom.customAnchorCount.textContent = String(AG.state.params.custom.anchors.length);
                    }
                    AG.notifyPresetDirty();
                    AG.draw();
                }
            });
        });
    }

    AG.setSliderValue = setSliderValue;
    AG.syncBezierModeButtons = syncBezierModeButtons;
    AG.syncCurrentInputs = syncCurrentInputs;
    AG.bindSliderEvents = bindSliderEvents;
})();