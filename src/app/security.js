(function () {
    'use strict';
    window.AG = window.AG || {};

    window.AG.openExternalLink = function(url) {
        if (typeof window.cep !== 'undefined' && window.cep.util && window.cep.util.openURLInDefaultBrowser) {
            window.cep.util.openURLInDefaultBrowser(url);
        } else {
            window.open(url, '_blank');
        }
    };

    window.AG.initSecurity = function() {
        const wrap = document.getElementById('header-secure-wrap');
        if (!wrap) return;

        const signature = 'WGGRAPH-V2';
        
        wrap.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <div id="logo" data-sig="${signature}">WG<span>GRAPH</span></div>
                    <div id="version">V2.0.5.0 // MOTION ARCHITECTURE</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
                    <button id="btn-check-update" class="header-action-btn" style="pointer-events: auto;">Check Update</button>
                </div>
            </div>
        `;

        function verifyIntegrity() {
            const checkWrap = document.getElementById('header-secure-wrap');
            const checkLogo = document.getElementById('logo');
            let tampered = false;

            if (!checkWrap || !checkLogo) {
                tampered = true;
            } else {
                if (checkLogo.dataset.sig !== signature || checkLogo.innerHTML !== 'WG<span>GRAPH</span>') {
                    tampered = true;
                }
                const styles = window.getComputedStyle(checkWrap);
                if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
                    tampered = true;
                }
            }
            if (tampered) triggerLockdown();
        }

        function triggerLockdown() {
            const canvasWrap = document.getElementById('canvas-wrap');
            const applyBtn = document.getElementById('btn-apply');
            const statusMsg = document.getElementById('status-msg');

            if (canvasWrap) {
                canvasWrap.style.filter = 'blur(10px) grayscale(100%)';
                canvasWrap.style.pointerEvents = 'none';
            }
            if (applyBtn) {
                applyBtn.disabled = true;
                applyBtn.innerText = 'TAMPER DETECTED';
                applyBtn.style.backgroundColor = '#ff3333';
                applyBtn.style.color = '#fff';
            }
            if (statusMsg) {
                statusMsg.textContent = 'LICENSE/CREDIT ERROR';
                statusMsg.className = 'err';
            }
        }

        setInterval(verifyIntegrity, 2500);
    };
})();