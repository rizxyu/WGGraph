(function() {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', () => {
        const btnLoad = document.getElementById('btn-load-preset');
        const btnExport = document.getElementById('btn-export-preset');
        
        const dialogBackdrop = document.getElementById('custom-import-dialog-backdrop');
        const dialogClose = document.getElementById('btn-close-import-dialog');
        const dialogCancel = document.getElementById('btn-import-cancel');
        const dialogOverwrite = document.getElementById('btn-import-overwrite');
        const dialogMerge = document.getElementById('btn-import-merge');
        const dialogInfo = document.getElementById('custom-import-info');

        let pendingPresets = null;

        if (btnLoad) btnLoad.onclick = handleLoad;
        if (btnExport) btnExport.onclick = handleExport;

        if (dialogClose) dialogClose.onclick = hideModal;
        if (dialogCancel) dialogCancel.onclick = hideModal;
        
        if (dialogOverwrite) {
            dialogOverwrite.onclick = () => {
                if (pendingPresets) {
                    // Map name to label for compatibility
                    const cleaned = pendingPresets.map(preset => {
                        const copy = JSON.parse(JSON.stringify(preset));
                        if (!copy.label && copy.name) {
                            copy.label = copy.name;
                            delete copy.name;
                        }
                        return copy;
                    });
                    savePresets(cleaned);
                    showStatus("PRESETS IMPORTED ✓", false);
                    hideModal();
                    setTimeout(() => window.location.reload(), 800);
                }
            };
        }

        if (dialogMerge) {
            dialogMerge.onclick = () => {
                if (pendingPresets) {
                    const existing = getExistingPresets();
                    const merged = mergePresets(existing, pendingPresets);
                    savePresets(merged);
                    showStatus("PRESETS MERGED ✓", false);
                    hideModal();
                    setTimeout(() => window.location.reload(), 800);
                }
            };
        }

        function getExistingPresets() {
            try {
                const raw = localStorage.getItem('wggraph.userPresets.v1');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) return parsed;
                }
            } catch (e) {
                console.error("Error reading existing presets:", e);
            }
            return [];
        }

        function savePresets(presets) {
            localStorage.setItem('wggraph.userPresets.v1', JSON.stringify(presets));
        }

        function mergePresets(existing, imported) {
            const merged = [...existing];
            imported.forEach(newPreset => {
                // Support both label and name
                let label = newPreset.label || newPreset.name || "Untitled Preset";
                let uniqueLabel = label;
                let counter = 1;
                
                const labelExists = (lbl) => merged.some(p => p.label === lbl);
                
                if (labelExists(uniqueLabel)) {
                    uniqueLabel = `${uniqueLabel} (Imported)`;
                    while (labelExists(uniqueLabel)) {
                        uniqueLabel = `${label} (Imported ${counter})`;
                        counter++;
                    }
                }
                
                // Clone preset and set label
                const presetToPush = JSON.parse(JSON.stringify(newPreset));
                presetToPush.label = uniqueLabel;
                if ('name' in presetToPush) delete presetToPush.name;
                merged.push(presetToPush);
            });
            return merged;
        }

        function showStatus(msg, isError) {
            const statusMsg = document.getElementById('status-msg');
            if (statusMsg) {
                statusMsg.innerText = msg;
                statusMsg.className = isError ? 'err' : 'ok';
                setTimeout(() => {
                    statusMsg.innerText = 'READY';
                    statusMsg.className = '';
                }, 3000);
            }
        }

        function hideModal() {
            if (dialogBackdrop) {
                dialogBackdrop.classList.add('hidden');
            }
            pendingPresets = null;
        }

        function processImportData(rawJson) {
            try {
                const parsed = JSON.parse(rawJson);
                if (!Array.isArray(parsed)) {
                    showStatus("INVALID PRESET FILE ✗", true);
                    return;
                }
                
                if (parsed.length === 0) {
                    showStatus("PRESET FILE IS EMPTY ✗", true);
                    return;
                }

                // Simple structural check (accept either label or name, and require engine)
                const isValid = parsed.every(item => typeof item === 'object' && item !== null && ('label' in item || 'name' in item) && 'engine' in item);
                if (!isValid) {
                    showStatus("INVALID PRESET STRUCTURE ✗", true);
                    return;
                }

                pendingPresets = parsed;
                
                // Show import dialog
                if (dialogBackdrop && dialogInfo) {
                    dialogInfo.innerText = `Found ${parsed.length} preset(s) in the file.\n\nChoose 'Merge' to combine them with your current presets (duplicates will be renamed), or 'Overwrite' to completely replace your current library.`;
                    dialogBackdrop.classList.remove('hidden');
                }
            } catch (e) {
                showStatus("FAILED TO PARSE JSON ✗", true);
                console.error(e);
            }
        }

        // Export Functionality
        function handleExport() {
            const presets = getExistingPresets();
            if (presets.length === 0) {
                showStatus("NO PRESETS TO EXPORT ✗", true);
                return;
            }

            const presetsStr = JSON.stringify(presets, null, 2);

            // Check if we are running in CEP
            if (window.cep && window.cep.fs) {
                try {
                    const csInterface = new CSInterface();
                    const script = 'var f = File.saveDialog("Export Presets", "JSON:*.json"); f ? f.fsName : "null"';
                    csInterface.evalScript(script, (filePath) => {
                        if (filePath && filePath !== "null") {
                            const writeResult = window.cep.fs.writeFile(filePath, presetsStr);
                            if (writeResult.err === 0) {
                                showStatus("PRESETS EXPORTED ✓", false);
                            } else {
                                showStatus("FAILED TO WRITE FILE ✗", true);
                            }
                        }
                    });
                } catch (e) {
                    console.error(e);
                    triggerBrowserDownload(presetsStr);
                }
            } else {
                triggerBrowserDownload(presetsStr);
            }
        }

        function triggerBrowserDownload(presetsStr) {
            // Fallback for standard web browser
            const blob = new Blob([presetsStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'wggraph_presets.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showStatus("PRESETS EXPORTED ✓", false);
        }

        // Load/Import Functionality
        function handleLoad() {
            // Check if we are running in CEP
            if (window.cep && window.cep.fs && typeof window.cep.fs.showOpenDialog === 'function') {
                let defaultPath = "";
                try {
                    const csInterface = new CSInterface();
                    defaultPath = csInterface.getSystemPath(SystemPath.MY_DOCUMENTS);
                } catch (e) {
                    console.error(e);
                }
                const result = window.cep.fs.showOpenDialog(false, false, "Import Presets", defaultPath, ["json"]);
                if (result.err === 0 && result.data && result.data.length > 0) {
                    const readResult = window.cep.fs.readFile(result.data[0]);
                    if (readResult.err === 0 && readResult.data) {
                        processImportData(readResult.data);
                    } else {
                        showStatus("FAILED TO READ FILE ✗", true);
                    }
                }
            } else {
                // Fallback for standard web browser
                let fileInput = document.getElementById('hidden-import-file');
                if (!fileInput) {
                    fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.id = 'hidden-import-file';
                    fileInput.accept = '.json';
                    fileInput.style.display = 'none';
                    document.body.appendChild(fileInput);
                    
                    fileInput.onchange = (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                            processImportData(evt.target.result);
                            fileInput.value = ''; // Reset input
                        };
                        reader.readAsText(file);
                    };
                }
                fileInput.click();
            }
        }
    });
})();
