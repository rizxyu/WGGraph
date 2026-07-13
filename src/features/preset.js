(function () {
    'use strict';
    const AG = window.AG;

    function notifyPresetDirty() {
        if (AG.presetManager) AG.presetManager.clearActivePreset();
    }

    function setToolIcons() {
        AG.dom.mirrorButton.innerHTML = '<span class="preset-icon-svg"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6l-4 6 4 6"/><path d="M16 6l4 6-4 6"/><path d="M10 12h4"/></svg></span>';
        AG.dom.settingsButton.innerHTML = '<span class="preset-icon-svg"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5A3.5 3.5 0 1 1 12 15.5A3.5 3.5 0 1 1 12 8.5Z"/><path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 0 1 0 1.4l-1.2 1.2a1 1 0 0 1-1.4 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1 1 0 0 1-1 1h-1.8a1 1 0 0 1-1-1v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1 1 0 0 1-1.4 0l-1.2-1.2a1 1 0 0 1 0-1.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1 1 0 0 1-1-1v-1.8a1 1 0 0 1 1-1h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1 1 0 0 1 0-1.4l1.2-1.2a1 1 0 0 1 1.4 0l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1 1 0 0 1 1-1h1.8a1 1 0 0 1 1 1v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1 1 0 0 1 1.4 0l1.2 1.2a1 1 0 0 1 0 1.4l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a1 1 0 0 1 1 1v1.8a1 1 0 0 1-1 1h-.2a1 1 0 0 0-.9.6Z"/></svg></span>';
        AG.dom.settingsCloseButton.innerHTML = '<span class="preset-icon-svg"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg></span>';
    }

    function initPresetFeatures() {
        AG.presetDialog = window.WGGraphPresetDialog({
            backdrop: AG.dom.dialogBackdrop,
            title: AG.dom.dialogTitle,
            description: AG.dom.dialogDescription,
            inputWrap: AG.dom.dialogInputWrap,
            input: AG.dom.dialogInput,
            message: AG.dom.dialogMessage,
            conflict: AG.dom.dialogConflict,
            conflictTitle: AG.dom.dialogConflictTitle,
            conflictText: AG.dom.dialogConflictText,
            conflictActions: AG.dom.dialogConflictActions,
            close: AG.dom.closePresetDialogButton,
            cancel: AG.dom.dialogCancel,
            confirm: AG.dom.dialogConfirm
        });
        AG.presetManager = window.WGGraphPresetManager({
            engine: window.WGGraphEngine,
            dialog: AG.presetDialog,
            grid: AG.dom.presetGrid,
            saveButton: AG.dom.savePresetButton,
            closeDialogButton: AG.dom.closePresetDialogButton,
            initialEngine: AG.state.engine,
            getCurrentSnapshot: AG.getCurrentSnapshot,
            applyPreset: AG.applyPresetState,
            setStatus: AG.setStatus
        });
        AG.presetManager.setEngine(AG.state.engine, { preserveActive: true });
    }

    AG.notifyPresetDirty = notifyPresetDirty;
    AG.setToolIcons = setToolIcons;
    AG.initPresetFeatures = initPresetFeatures;
})();