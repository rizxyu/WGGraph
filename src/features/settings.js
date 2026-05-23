(function () {
    'use strict';
    const AG = window.AG;

    function isGhostEnabled() {
        return !!(AG.currentSettings && AG.currentSettings.features && AG.currentSettings.features.ghostEnabled);
    }

    function captureReferenceCurve() {
        if (!isGhostEnabled()) { AG.state.referenceCurve = null; return; }
        AG.state.referenceCurve = AG.getCurrentSnapshot();
    }

    function refreshFeatureVisibility() {
        const mirrorEnabled = !!(AG.currentSettings && AG.currentSettings.features && AG.currentSettings.features.mirrorEnabled);
        AG.dom.mirrorButton.classList.toggle('hidden', !mirrorEnabled);
        if (!isGhostEnabled()) AG.state.referenceCurve = null;
    }

    function initSettingsFeatures() {
        AG.settingsPanel = window.ArkaGraphSettingsPanel({
            initialSettings: AG.currentSettings,
            openButton: AG.dom.settingsButton,
            backdrop: AG.dom.settingsBackdrop,
            closeButtons: [AG.dom.settingsCloseButton, AG.dom.settingsDoneButton],
            enableMirror: AG.dom.settingsEnableMirror,
            enableGhost: AG.dom.settingsEnableGhost,
            themeGrid: AG.dom.settingsThemeGrid,
            accentGrid: AG.dom.settingsAccentGrid,
            onChange: function (nextSettings) {
                AG.currentSettings = nextSettings;
                refreshFeatureVisibility();
                if (AG.presetManager) AG.presetManager.refresh();
                AG.draw();
            }
        });
        AG.currentSettings = AG.settingsPanel.getSettings();
        AG.setToolIcons();
        refreshFeatureVisibility();
    }

    AG.isGhostEnabled = isGhostEnabled;
    AG.captureReferenceCurve = captureReferenceCurve;
    AG.refreshFeatureVisibility = refreshFeatureVisibility;
    AG.initSettingsFeatures = initSettingsFeatures;
})();