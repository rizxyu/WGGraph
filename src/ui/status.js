(function () {
    'use strict';
    const AG = window.AG;

    function setStatus(message, type) {
        AG.dom.status.textContent = message;
        AG.dom.status.className = type || '';
        if (AG.statusTimer) clearTimeout(AG.statusTimer);
        AG.statusTimer = window.setTimeout(function () {
            AG.dom.status.textContent = 'READY';
            AG.dom.status.className = '';
        }, 3000);
    }

    AG.setStatus = setStatus;
})();