(function () {
    'use strict';
    const AG = window.AG;

    function isGhostEnabled() {
        return !!(AG.currentSettings && AG.currentSettings.features && AG.currentSettings.features.ghostEnabled);
    }

    function hasGraphBackground() {
        const background = AG.currentSettings && AG.currentSettings.background;
        return !!(background && background.enabled && background.dataUrl);
    }

    function applyGraphBackground() {
        const background = AG.currentSettings && AG.currentSettings.background;
        const enabled = hasGraphBackground();
        AG.dom.canvasContainer.classList.toggle('has-custom-bg', enabled);
        AG.dom.canvasBackground.classList.toggle('active', enabled);
        AG.dom.canvasBackgroundGradient.classList.toggle('active', enabled);
        AG.dom.canvasBackground.style.backgroundImage = enabled ? 'url("' + background.dataUrl + '")' : '';
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
        AG.settingsPanel = window.WGGraphSettingsPanel({
            initialSettings: AG.currentSettings,
            openButton: AG.dom.settingsButton,
            backdrop: AG.dom.settingsBackdrop,
            closeButtons: [AG.dom.settingsCloseButton, AG.dom.settingsDoneButton],
            enableMirror: AG.dom.settingsEnableMirror,
            enableGhost: AG.dom.settingsEnableGhost,
            backgroundEnabled: AG.dom.settingsBackgroundEnabled,
            backgroundInput: AG.dom.settingsBackgroundInput,
            backgroundChoose: AG.dom.settingsBackgroundChoose,
            backgroundRemove: AG.dom.settingsBackgroundRemove,
            backgroundPreview: AG.dom.settingsBackgroundPreview,
            backgroundGallery: AG.dom.settingsBackgroundGallery,
            backgroundMessage: AG.dom.settingsBackgroundMessage,
            themeGrid: AG.dom.settingsThemeGrid,
            accentGrid: AG.dom.settingsAccentGrid,
            onChange: function (nextSettings) {
                AG.currentSettings = nextSettings;
                applyGraphBackground();
                refreshFeatureVisibility();
                if (AG.presetManager) AG.presetManager.refresh();
                AG.draw();
            }
        });
        AG.currentSettings = AG.settingsPanel.getSettings();
        AG.setToolIcons();
        applyGraphBackground();
        refreshFeatureVisibility();
    }

    AG.isGhostEnabled = isGhostEnabled;
    AG.hasGraphBackground = hasGraphBackground;
    AG.applyGraphBackground = applyGraphBackground;
    AG.captureReferenceCurve = captureReferenceCurve;
    AG.refreshFeatureVisibility = refreshFeatureVisibility;
    AG.initSettingsFeatures = initSettingsFeatures;
})();
