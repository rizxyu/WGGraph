(function () {
    'use strict';
    const AG = window.AG;

    function clampLoopCount(value) {
        return window.WGGraphLooping ? window.WGGraphLooping.clampCount(value) : 0;
    }

    function isLoopActive() {
        return !!AG.state.loop.enabled && (AG.state.loop.infinite || AG.state.loop.inCount > 0 || AG.state.loop.outCount > 0);
    }

    function refreshApplyButton() {
        const loopActive = isLoopActive();
        AG.dom.applyButton.textContent = loopActive ? 'APPLY LOOP' : 'APPLY';
        AG.dom.applyButton.classList.toggle('loop-active', loopActive);
    }

    function syncLoopInputs() {
        const enabled = !!AG.state.loop.enabled;
        const infinite = !!AG.state.loop.infinite;
        const dom = AG.dom;
        dom.loopEnabled.checked = enabled;
        dom.loopInfinite.checked = infinite;
        dom.loopInCount.value = String(AG.state.loop.inCount);
        dom.loopOutCount.value = String(AG.state.loop.outCount);
        dom.loopInfinite.disabled = !enabled;
        const disableCounts = !enabled || infinite;
        dom.loopInCount.disabled = disableCounts;
        dom.loopOutCount.disabled = disableCounts;
        dom.loopInCount.parentElement.style.opacity = disableCounts ? '0.3' : '1';
        dom.loopOutCount.parentElement.style.opacity = disableCounts ? '0.3' : '1';
        const infiniteUI = document.getElementById('loop-infinite-ui');
        if (!enabled) {
            infiniteUI.style.opacity = '0.3';
            infiniteUI.style.borderColor = '#333';
            infiniteUI.style.color = '#666';
            infiniteUI.style.background = 'transparent';
        } else {
            infiniteUI.style.opacity = '1';
            if (infinite) {
                infiniteUI.style.borderColor = 'var(--node-secondary, #00c4a7)';
                infiniteUI.style.color = 'var(--node-secondary, #00c4a7)';
                infiniteUI.style.background = 'rgba(0, 196, 167, 0.1)';
            } else {
                infiniteUI.style.borderColor = '#333';
                infiniteUI.style.color = '#888';
                infiniteUI.style.background = 'transparent';
            }
        }
    }

    AG.clampLoopCount = clampLoopCount;
    AG.isLoopActive = isLoopActive;
    AG.refreshApplyButton = refreshApplyButton;
    AG.syncLoopInputs = syncLoopInputs;
})();