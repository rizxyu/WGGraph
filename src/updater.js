(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const logoWrap = document.getElementById('header-secure-wrap');
        const btnUpdate = document.getElementById('btn-update-plugin');

        const toast = document.getElementById('update-toast');
        const toastBody = document.getElementById('update-toast-body');
        const btnToastUpdate = document.getElementById('btn-toast-update');
        const btnToastDismiss = document.getElementById('btn-toast-dismiss');

        const btnCheckUpdate = document.getElementById('btn-check-update');
        const checkBackdrop = document.getElementById('update-check-dialog-backdrop');
        const checkClose = document.getElementById('btn-close-update-check');
        const checkCloseFooter = document.getElementById('btn-update-check-close');
        const checkContent = document.getElementById('update-check-content');

        let latestReleaseData = null;
        let localVersion = "2.0.41";

        // Setup logo and version dynamically (auto version sync from manifest)
        getCurrentVersion((version) => {
            localVersion = version;
            injectHeaderVersion(version);
            checkForUpdates(version);
        });

        // Toolbar update button click
        if (btnUpdate) {
            btnUpdate.onclick = () => triggerUpdateFlow();
        }

        // Toast update button clicks
        if (btnToastUpdate) {
            btnToastUpdate.onclick = () => {
                hideToast();
                triggerUpdateFlow();
            };
        }

        if (btnToastDismiss) {
            btnToastDismiss.onclick = hideToast;
        }

        // Check Update Dialog close actions
        const hideCheckDialog = () => {
            if (checkBackdrop) checkBackdrop.classList.add('hidden');
        };
        if (checkClose) checkClose.onclick = hideCheckDialog;
        if (checkCloseFooter) checkCloseFooter.onclick = hideCheckDialog;

        // Check Update Header Button click (using event delegation because it is dynamically injected)
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('#btn-check-update');
            if (btn) {
                if (checkBackdrop) checkBackdrop.classList.remove('hidden');
                if (checkContent) {
                    checkContent.innerHTML = `<div style="text-align: center; padding: 25px; color: var(--text1); font-family: 'JetBrains Mono', monospace;">Checking releases...</div>`;
                }
                loadReleaseList();
            }
        });

        function injectHeaderVersion(version) {
            if (logoWrap) {
                const interval = setInterval(() => {
                    const versionEl = document.getElementById('version');
                    if (versionEl) {
                        versionEl.innerText = 'v' + version;
                        clearInterval(interval);
                    }
                }, 100);
                setTimeout(() => clearInterval(interval), 5000);
            }
        }

        function getCurrentVersion(callback) {
            if (window.cep && window.cep.fs) {
                try {
                    const csInterface = new CSInterface();
                    const extensionPath = csInterface.getSystemPath(SystemPath.EXTENSION);
                    const fileResult = window.cep.fs.readFile(extensionPath + '/CSXS/manifest.xml');
                    if (fileResult.err === 0 && fileResult.data) {
                        const match = fileResult.data.match(/<Extension\s+Id="com\.wggraph\.panel"\s+Version="([^"]+)"/);
                        if (match) return callback(match[1]);
                    }
                } catch (e) {
                    console.error("Error reading manifest via CEP:", e);
                }
            }

            // Fallback
            fetch('../CSXS/manifest.xml')
                .then(res => res.text())
                .then(xml => {
                    const match = xml.match(/<Extension\s+Id="com\.wggraph\.panel"\s+Version="([^"]+)"/);
                    callback(match ? match[1] : "2.0.41");
                })
                .catch(() => callback("2.0.41"));
        }

        function checkForUpdates(currentVer) {
            const repoUrl = 'https://api.github.com/repos/rizxyu/WGGraph/releases/latest';

            fetch(repoUrl, {
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                    'User-Agent': 'WGGraph-App'
                }
            })
                .then(res => {
                    if (!res.ok) throw new Error('Network error');
                    return res.json();
                })
                .then(data => {
                    if (data && data.tag_name) {
                        const latestVer = data.tag_name.replace(/^v/, '');
                        latestReleaseData = data;

                        if (isNewerVersion(currentVer, latestVer)) {
                            showUpdateUI(currentVer, latestVer);
                        }
                    }
                })
                .catch(err => {
                    console.log("Update check skipped (offline or rate limit):", err);
                });
        }

        function isNewerVersion(current, latest) {
            if (current === latest) return false;

            const clean = v => v.replace(/^v/, '').split(/[-.]/);
            const curParts = clean(current);
            const latParts = clean(latest);

            for (let i = 0; i < Math.max(curParts.length, latParts.length); i++) {
                const curP = curParts[i];
                const latP = latParts[i];

                if (curP === undefined) return true;
                if (latP === undefined) return false;

                const curNum = parseInt(curP, 10);
                const latNum = parseInt(latP, 10);

                if (!isNaN(curNum) && !isNaN(latNum)) {
                    if (latNum > curNum) return true;
                    if (latNum < curNum) return false;
                } else {
                    if (latP !== curP) {
                        return latP > curP;
                    }
                }
            }
            return false;
        }

        function showUpdateUI(currentVer, latestVer) {
            if (btnUpdate) {
                btnUpdate.classList.remove('hidden');
            }

            if (toast && toastBody) {
                toastBody.innerText = `WGGraph v${latestVer} tersedia (Versi Anda: v${currentVer}). Silakan perbarui untuk mendapatkan fitur terbaru.`;
                toast.classList.remove('hidden');
                setTimeout(() => {
                    toast.classList.add('show');
                }, 100);

                setTimeout(() => {
                    hideToast();
                }, 8000);
            }
        }

        function hideToast() {
            if (toast) {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.classList.add('hidden');
                }, 350);
            }
        }

        function showStatus(msg, isError) {
            const statusMsg = document.getElementById('status-msg');
            if (statusMsg) {
                statusMsg.innerText = msg;
                statusMsg.className = isError ? 'err' : 'ok';
            }
        }

        function loadReleaseList() {
            const releasesUrl = 'https://api.github.com/repos/rizxyu/WGGraph/releases';

            fetch(releasesUrl, {
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                    'User-Agent': 'WGGraph-App'
                }
            })
                .then(res => {
                    if (!res.ok) {
                        const err = new Error(`HTTP Error ${res.status}: ${res.statusText}`);
                        err.status = res.status;
                        throw err;
                    }
                    return res.json();
                })
                .then(releases => {
                    if (!checkContent) return;
                    if (!Array.isArray(releases) || releases.length === 0) {
                        checkContent.innerHTML = `<div style="text-align: center; padding: 25px; color: var(--text2);">No releases found.</div>`;
                        return;
                    }

                    let htmlContent = "";
                    releases.forEach(release => {
                        const tag = release.tag_name;
                        const date = new Date(release.published_at).toLocaleDateString();
                        const body = release.body || "No changelog provided.";

                        const zxpAsset = release.assets.find(asset => asset.name.endsWith('.zxp') || asset.name.endsWith('.zip'));
                        const downloadUrl = zxpAsset ? zxpAsset.browser_download_url : release.zipball_url;

                        const isCurrent = tag.replace(/^v/, '') === localVersion;
                        const badge = isCurrent ? ` <span style="font-size: 7px; color: var(--accent); background: rgba(0, 196, 167, 0.12); padding: 1px 4px; border-radius: 3px; margin-left: 5px;">CURRENT</span>` : "";

                        htmlContent += `
                            <div class="release-item">
                                <div class="release-header">
                                    <span class="release-tag">${tag}${badge}</span>
                                    <span class="release-date">${date}</span>
                                </div>
                                <div class="release-notes">${body}</div>
                                <button class="release-install-btn" data-url="${downloadUrl}" ${isCurrent ? 'disabled' : ''}>
                                    ${isCurrent ? 'Installed' : 'Install'}
                                </button>
                            </div>
                        `;
                    });

                    checkContent.innerHTML = htmlContent;

                    // Bind click listeners
                    const buttons = checkContent.querySelectorAll('.release-install-btn');
                    buttons.forEach(btn => {
                        btn.onclick = (e) => {
                            const url = e.target.getAttribute('data-url');
                            if (confirm("Apakah Anda yakin ingin menginstal rilis ini? \n\nPanel akan memperbarui file langsung di latar belakang.")) {
                                hideCheckDialog();
                                runAutoUpdate(url);
                            }
                        };
                    });
                })
                .catch(err => {
                    if (!checkContent) return;
                    console.error("Fetch releases error:", err);
                    checkContent.innerHTML = `
                        <div style="color: var(--red); padding: 15px; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px;">
                            <div style="font-weight: bold; font-size: 10px; margin-bottom: 6px; text-transform: uppercase;">Connection Failed</div>
                            <div style="line-height: 1.5; color: var(--text1); text-align: left; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; border: 1px solid rgba(255, 77, 106, 0.2);">
                                <strong>Message:</strong> ${err.message || 'Unknown Network Error'}<br/>
                                <strong>Status Code:</strong> ${err.status || 'N/A'}<br/><br/>
                                <span style="color: var(--text2);">Periksa koneksi internet Anda atau limitasi akses API GitHub.</span>
                            </div>
                        </div>
                    `;
                });
        }

        function triggerUpdateFlow() {
            if (!latestReleaseData) return;

            const zxpAsset = latestReleaseData.assets.find(asset => asset.name.endsWith('.zxp') || asset.name.endsWith('.zip'));
            const downloadUrl = zxpAsset ? zxpAsset.browser_download_url : latestReleaseData.zipball_url;

            if (confirm(`Apakah Anda ingin memperbarui WGGraph otomatis ke versi v${latestReleaseData.tag_name.replace(/^v/, '')}? \n\nPanel akan mengunduh dan melakukan instalasi langsung di latar belakang.`)) {
                runAutoUpdate(downloadUrl);
            }
        }

        function runAutoUpdate(downloadUrl) {
            function getNodeRequire() {
                if (typeof require !== 'undefined') return require;
                if (typeof window !== 'undefined' && typeof window.require !== 'undefined') return window.require;
                if (typeof window !== 'undefined' && window.cep && window.cep.node && typeof window.cep.node.require === 'function') {
                    return window.cep.node.require;
                }
                return null;
            }

            const nodeRequire = getNodeRequire();

            if (checkBackdrop) checkBackdrop.classList.remove('hidden');
            if (checkContent) {
                checkContent.innerHTML = `
                    <div style="padding: 20px; display: flex; flex-direction: column; gap: 12px; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text1);">
                        <div style="font-weight: bold; color: var(--accent); font-size: 10px; text-transform: uppercase;">Downloading Update...</div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Progress: <span id="download-percent">0</span>%</span>
                            <span>Speed: <span id="download-speed">0.00</span> Mbps</span>
                        </div>
                        <div style="width: 100%; height: 6px; background: var(--bg3); border-radius: 3px; overflow: hidden; border: 1px solid var(--border);">
                            <div id="download-progress-bar" style="width: 0%; height: 100%; background: var(--accent); transition: width 0.1s ease;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; color: var(--text2); font-size: 8px;">
                            <span>Size: <span id="download-size">0.00 / 0.00</span> MB</span>
                            <span id="download-status" style="color: var(--yellow);">Connecting...</span>
                        </div>
                    </div>
                `;
            }

            let extensionPath = "";
            try {
                const csInterface = new CSInterface();
                extensionPath = csInterface.getSystemPath(SystemPath.EXTENSION);
            } catch (e) {
                console.error(e);
            }

            if (!extensionPath || !nodeRequire) {
                alert("Node.js tidak terdeteksi. Fitur Auto Update hanya dapat berjalan di dalam Adobe After Effects.");
                showStatus("AUTO UPDATE NOT AVAILABLE", true);
                return;
            }

            const os = nodeRequire('os');
            const path = nodeRequire('path');
            const fs = nodeRequire('fs');
            const { exec } = nodeRequire('child_process');

            const tempZip = path.join(os.tmpdir(), 'wggraph_update.zip');
            const tempExtract = path.join(os.tmpdir(), 'wggraph_extracted');
            const psDest = extensionPath.replace(/\\/g, '/').replace(/\/+$/, '');

            const percentEl = document.getElementById('download-percent');
            const speedEl = document.getElementById('download-speed');
            const progressBar = document.getElementById('download-progress-bar');
            const sizeEl = document.getElementById('download-size');
            const statusEl = document.getElementById('download-status');

            function updateUIStatus(statusText, color = 'var(--yellow)') {
                if (statusEl) {
                    statusEl.innerText = statusText;
                    statusEl.style.color = color;
                }
            }

            function runPowerShell(scriptContent, callback) {
                try {
                    const tempScript = path.join(os.tmpdir(), `wgg_ps_${Date.now()}.ps1`);
                    fs.writeFileSync(tempScript, scriptContent, 'utf-8');

                    const cmd = `powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "${tempScript.replace(/\\/g, '/')}"`;
                    exec(cmd, (err, stdout, stderr) => {
                        try {
                            if (fs.existsSync(tempScript)) fs.unlinkSync(tempScript);
                        } catch(e) {}
                        callback(err, stdout, stderr);
                    });
                } catch(e) {
                    callback(e);
                }
            }

            updateUIStatus('Connecting...');

            function downloadWithProgress(url, destPath, onProgress, onComplete, onError) {
                const https = nodeRequire('https');

                const request = https.get(url, {
                    headers: {
                        'User-Agent': 'WGGraph-App'
                    }
                }, (res) => {
                    if (res.statusCode === 301 || res.statusCode === 302) {
                        downloadWithProgress(res.headers.location, destPath, onProgress, onComplete, onError);
                        return;
                    }

                    if (res.statusCode !== 200) {
                        onError(new Error(`HTTP status code ${res.statusCode}`));
                        return;
                    }

                    const totalBytes = parseInt(res.headers['content-length'], 10);
                    let receivedBytes = 0;
                    let startTime = Date.now();

                    const fileStream = fs.createWriteStream(destPath);
                    res.pipe(fileStream);

                    res.on('data', (chunk) => {
                        receivedBytes += chunk.length;
                        const duration = (Date.now() - startTime) / 1000;
                        let speedMbps = 0;
                        if (duration > 0) {
                            const speedBytesPerSec = receivedBytes / duration;
                            speedMbps = (speedBytesPerSec * 8) / (1024 * 1024);
                        }
                        const percent = totalBytes ? Math.round((receivedBytes / totalBytes) * 100) : 0;
                        const totalMB = totalBytes ? (totalBytes / (1024 * 1024)).toFixed(2) : "Unknown";
                        const receivedMB = (receivedBytes / (1024 * 1024)).toFixed(2);

                        onProgress({
                            percent,
                            speed: speedMbps.toFixed(2),
                            receivedMB,
                            totalMB
                        });
                    });

                    fileStream.on('finish', () => {
                        fileStream.close();
                    });

                    fileStream.on('close', () => {
                        onComplete();
                    });

                    fileStream.on('error', (err) => {
                        onError(err);
                    });
                });

                request.on('error', (err) => {
                    onError(err);
                });
            }

            downloadWithProgress(downloadUrl, tempZip,
                (stats) => {
                    if (percentEl) percentEl.innerText = stats.percent;
                    if (speedEl) speedEl.innerText = stats.speed;
                    if (progressBar) progressBar.style.width = stats.percent + '%';
                    if (sizeEl) sizeEl.innerText = `${stats.receivedMB} / ${stats.totalMB}`;
                    updateUIStatus(`Downloading... ${stats.percent}%`, 'var(--accent)');
                },
                () => {
                    updateUIStatus('Verifying...', 'var(--yellow)');
                    setTimeout(() => {
                        try {
                            if (!fs.existsSync(tempZip) || fs.statSync(tempZip).size === 0) {
                                throw new Error("Downloaded file is empty or missing.");
                            }
                            extractZip();
                        } catch (err) {
                            console.error("Verification failed:", err);
                            updateUIStatus('Verification failed', 'var(--red)');
                            alert("Verifikasi berkas gagal (File unduhan kosong atau rusak).");
                        }
                    }, 500);
                },
                (err) => {
                    console.error("Download error:", err);
                    updateUIStatus('Download failed', 'var(--red)');
                    alert("Koneksi internet gagal atau download gagal: " + err.message);
                }
            );

            function extractZip() {
                updateUIStatus('Extracting...', 'var(--yellow)');

                const psExtract = `
                $tempZip = "${tempZip.replace(/\\/g, '/')}"
                $dest = "${tempExtract.replace(/\\/g, '/')}"
                if (Test-Path $dest) { Remove-Item -Path $dest -Recurse -Force }
                New-Item -ItemType Directory -Path $dest -Force
                Expand-Archive -Path $tempZip -DestinationPath $dest -Force
                `;

                runPowerShell(psExtract, (err) => {
                    if (err) {
                        console.error("Extraction error:", err);
                        updateUIStatus('Extraction failed', 'var(--red)');
                        alert("Gagal mengekstrak berkas pembaruan (File ZIP rusak). Detail: " + err.message);
                        return;
                    }

                    replaceFiles();
                });
            }

            function replaceFiles() {
                updateUIStatus('Replacing files...', 'var(--yellow)');

                const psReplace = `
                $src = "${tempExtract.replace(/\\/g, '/')}"
                $dest = "${psDest.replace(/\\/g, '/')}"
                Copy-Item -Path "$src/*" -Destination $dest -Recurse -Force
                `;

                runPowerShell(psReplace, (err) => {
                    if (err) {
                        console.error("Replace files error:", err);
                        updateUIStatus('Replacing failed', 'var(--red)');
                        alert("Gagal mengganti berkas plugin (Izin ditolak atau berkas sedang digunakan). Detail: " + err.message);
                        return;
                    }

                    cleanTempFiles();
                });
            }

            function cleanTempFiles() {
                updateUIStatus('Cleaning temporary files...', 'var(--yellow)');

                const psClean = `
                $zip = "${tempZip.replace(/\\/g, '/')}"
                $folder = "${tempExtract.replace(/\\/g, '/')}"
                if (Test-Path $zip) { Remove-Item -Path $zip -Force }
                if (Test-Path $folder) { Remove-Item -Path $folder -Recurse -Force }
                `;

                runPowerShell(psClean, (err) => {
                    if (err) {
                        console.error("Cleanup error:", err);
                    }

                    completeUpdate();
                });
            }

            function completeUpdate() {
                updateUIStatus('Update completed.', 'var(--accent)');

                if (checkContent) {
                    checkContent.innerHTML = `
                        <div style="padding: 20px; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text1);">
                            <div style="font-weight: bold; color: var(--accent); font-size: 11px; margin-bottom: 8px; text-transform: uppercase;">Update Completed ✓</div>
                            <div style="line-height: 1.5; margin-bottom: 12px;">
                                Pembaruan berhasil dipasang!<br>
                                <span style="color: var(--yellow); font-weight: bold;">Mohon restart After Effects jika perubahan tidak terlihat.</span><br><br>
                                Panel akan memuat ulang secara otomatis dalam <span id="restart-countdown" style="color: var(--accent); font-weight: bold;">5</span> detik...
                            </div>
                        </div>
                    `;

                    let count = 5;
                    const countdownEl = document.getElementById('restart-countdown');
                    const interval = setInterval(() => {
                        count--;
                        if (countdownEl) countdownEl.innerText = count;
                        if (count <= 0) {
                            clearInterval(interval);
                            window.location.reload();
                        }
                    }, 1000);
                } else {
                    window.location.reload();
                }
            }
        }
    });
})();
