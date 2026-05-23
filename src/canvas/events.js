(function () {
    'use strict';
    const AG = window.AG;

    function bindCanvasEvents() {
        AG.dom.canvas.addEventListener('wheel', function (event) {
            event.preventDefault();
            AG.scaleY = event.deltaY < 0 ? AG.scaleY * 1.1 : AG.scaleY / 1.1;
            AG.scaleY = Math.max(0.1, Math.min(10, AG.scaleY));
            AG.draw();
        });

        AG.dom.canvas.addEventListener('mousedown', function (event) {
            const pointer = AG.getCanvasPointer(event);
            const hit = AG.hitTest(pointer.x, pointer.y);
            if (hit) {
                AG.state.dragging = hit;
                if (hit.type === 'bezier' && AG.state.params.bezier.mode === 'speed') {
                    const speeds = AG.getBezierSpeeds(AG.state.params.bezier);
                    AG.state.dragStartV = hit.index === 0 ? speeds.s1 : speeds.s2;
                }
                return;
            }
            if (AG.state.engine === 'custom' && event.button === 0) {
                AG.addCustomAnchor(pointer);
            }
        });

        AG.dom.canvas.addEventListener('contextmenu', function (event) {
            event.preventDefault();
            if (AG.state.engine === 'custom') AG.removeCustomAnchor(AG.getCanvasPointer(event));
        });

        document.addEventListener('mousemove', function (event) {
            const pointer = AG.getCanvasPointer(event);
            if (!AG.state.dragging) {
                const r = pointer.rect;
                if (event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom) {
                    const n = AG.fromCanvas(pointer.x, pointer.y);
                    AG.dom.canvasCoords.textContent = 'T:' + n.t.toFixed(3) + ' V:' + n.v.toFixed(3);
                }
                return;
            }
            AG.updateDraggedState(AG.fromCanvas(pointer.x, pointer.y));
            AG.notifyPresetDirty();
            AG.draw();
        });

        document.addEventListener('mouseup', function () {
            AG.state.dragging = null;
            AG.state.dragStartV = undefined;
            AG.state.guidelineY = undefined;
            AG.draw();
        });
    }

    AG.bindCanvasEvents = bindCanvasEvents;
})();