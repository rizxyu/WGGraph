(function (root) {

    'use strict';

    const wggraphEngine = root.WGGraphEngine;

    wggraphEngine.PRESETS = [
        { id: 'builtin-ease',      label: 'EASE',      engine: 'bezier',  params: { x1: 0.25, y1: 0.1,  x2: 0.25, y2: 1.0,  mode: 'value' } },
        { id: 'builtin-ease-in',   label: 'EASE IN',   engine: 'bezier',  params: { x1: 0.42, y1: 0.0,  x2: 1.0,  y2: 1.0,  mode: 'value' } },
        { id: 'builtin-ease-out',  label: 'EASE OUT',  engine: 'bezier',  params: { x1: 0.0,  y1: 0.0,  x2: 0.58, y2: 1.0,  mode: 'value' } },
        { id: 'builtin-sharp-in',  label: 'SHARP IN',  engine: 'bezier',  params: { x1: 0.9,  y1: 0.0,  x2: 0.9,  y2: 1.0,  mode: 'value' } },
        { id: 'builtin-spring',    label: 'SPRING',    engine: 'elastic', params: { amplitude: 1.2, frequency: 4, decay: 5 } },
        { id: 'builtin-rubber',    label: 'RUBBER',    engine: 'elastic', params: { amplitude: 1.5, frequency: 3, decay: 4 } },
        { id: 'builtin-bounce',    label: 'BOUNCE',    engine: 'bounce',  params: { bounces: 3, restitution: 0.5 } },
        { id: 'builtin-steps-8',   label: 'STEPS 8',   engine: 'steps',   params: { count: 8, position: 'end' } },
        { id: 'builtin-gravity',   label: 'GRAVITY',   engine: 'bezier',  params: { x1: 0.17, y1: 0.17, x2: 0.83, y2: 0.0,  mode: 'value' } },
        { id: 'builtin-overshoot', label: 'OVERSHOOT', engine: 'elastic', params: { amplitude: 1.3, frequency: 2, decay: 6 } },
        { id: 'builtin-wave',      label: 'WAVE',      engine: 'wave',    params: { amplitude: 1.0, frequency: 3.0, phase: 0.0 } },
        { id: 'builtin-custom',    label: 'CUSTOM',    engine: 'custom',  params: null }
    ];

})(window);