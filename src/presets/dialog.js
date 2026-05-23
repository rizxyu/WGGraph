(function (root) {
    'use strict';

    root.ArkaGraphPresetDialog = function createPresetDialog(elements) {
        let currentConfig = null;
        let currentMode = 'input';

        function openBase(config, mode) {
            currentConfig = config || {};
            currentMode = mode || 'input';

            elements.title.textContent = currentConfig.title || 'Preset';
            elements.description.textContent = currentConfig.description || '';
            elements.message.textContent = '';
            elements.message.className = 'dialog-message';
            elements.conflict.classList.add('hidden');
            elements.conflictActions.innerHTML = '';
            elements.backdrop.classList.remove('hidden');
            elements.backdrop.dataset.mode = currentMode;
            elements.inputWrap.classList.toggle('hidden', currentMode !== 'input');
            elements.input.value = currentConfig.initialValue || '';
            elements.input.select();
            elements.confirm.textContent = currentConfig.confirmLabel || 'Save';
            elements.confirm.classList.toggle('danger', currentConfig.tone === 'danger');
            elements.confirm.classList.toggle('accent', currentConfig.tone !== 'danger');
            elements.cancel.textContent = currentConfig.cancelLabel || 'Cancel';
        }

        function close() {
            elements.backdrop.classList.add('hidden');
            elements.backdrop.dataset.mode = '';
            elements.conflict.classList.add('hidden');
            elements.conflictActions.innerHTML = '';
            currentConfig = null;
        }

        function setMessage(text, tone) {
            elements.message.textContent = text || '';
            elements.message.className = 'dialog-message';
            if (tone) {
                elements.message.classList.add(tone);
            }
        }

        function clearConflict() {
            elements.conflict.classList.add('hidden');
            elements.conflictActions.innerHTML = '';
        }

        function showConflict(config) {
            clearConflict();
            elements.conflict.classList.remove('hidden');
            elements.conflictTitle.textContent = config.title || 'Name already exists';
            elements.conflictText.textContent = config.message || '';

            (config.actions || []).forEach(function (action) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'dialog-chip-btn ' + (action.tone || 'ghost');
                button.textContent = action.label;
                button.addEventListener('click', action.onClick);
                elements.conflictActions.appendChild(button);
            });
        }

        function getValue() {
            return elements.input.value.trim();
        }

        function setValue(value) {
            elements.input.value = value || '';
        }

        function focusInput() {
            elements.input.focus();
            elements.input.select();
        }

        elements.close.addEventListener('click', close);
        elements.cancel.addEventListener('click', close);
        elements.backdrop.addEventListener('click', function (event) {
            if (event.target === elements.backdrop) {
                close();
            }
        });
        elements.input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' && currentMode === 'input') {
                event.preventDefault();
                elements.confirm.click();
            }
            if (event.key === 'Escape') {
                close();
            }
        });
        elements.confirm.addEventListener('click', function () {
            if (!currentConfig || typeof currentConfig.onConfirm !== 'function') {
                close();
                return;
            }

            currentConfig.onConfirm(currentMode === 'input' ? getValue() : null, {
                close: close,
                setMessage: setMessage,
                showConflict: showConflict,
                clearConflict: clearConflict,
                getValue: getValue,
                setValue: setValue,
                focusInput: focusInput
            });
        });

        return {
            openInput: function (config) {
                openBase(config, 'input');
                focusInput();
            },
            openConfirm: function (config) {
                openBase(config, 'confirm');
            },
            close: close
        };
    };
})(window);
