function arkaGraphApplyNativeEase(x1, y1, x2, y2) {
    try {
        var comp = app.project.activeItem;
        if (!comp) return "ERROR: No active composition.";
        var props = getSelectedKeyframeProperties(comp);
        if (props.length === 0) return "ERROR: No keys selected.";
        app.beginUndoGroup("ArkaGraph: Apply Ease");
        var infOut = Math.max(0.1, Math.min(100, x1 * 100));
        var infIn  = Math.max(0.1, Math.min(100, (1 - x2) * 100));
        var eff_x1 = Math.max(0.001, x1);
        var eff_x2 = Math.max(0.001, 1 - x2);
        for (var p = 0; p < props.length; p++) {
            var prop = props[p];
            var selKeys = [];
            for (var k = 1; k <= prop.numKeys; k++) {
                if (prop.keySelected(k)) selKeys.push(k);
            }
            for (var i = 0; i < selKeys.length; i++) {
                var kIdx = selKeys[i];
                if (kIdx >= prop.numKeys) continue;
                var v0 = prop.keyValue(kIdx);
                var v1 = prop.keyValue(kIdx + 1);
                var t0 = prop.keyTime(kIdx);
                var t1 = prop.keyTime(kIdx + 1);
                var dx = t1 - t0;
                var isSpatial = (prop.propertyValueType == PropertyValueType.TwoD_SPATIAL || prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL);
                var dim = 1;
                if (!isSpatial) {
                    if (prop.propertyValueType == PropertyValueType.TwoD) dim = 2;
                    if (prop.propertyValueType == PropertyValueType.ThreeD || prop.propertyValueType == PropertyValueType.COLOR) dim = 3;
                    if (prop.propertyValueType == PropertyValueType.FourD) dim = 4;
                }
                var inArr = [], outArr = [];
                if (isSpatial) {
                    var sum = 0;
                    for (var s = 0; s < v0.length; s++) sum += Math.pow(v1[s] - v0[s], 2);
                    var dy_sp = Math.sqrt(sum);
                    var avgS_sp = (dx === 0) ? 0 : dy_sp / dx;
                    var sOut_sp = (y1 / eff_x1) * avgS_sp;
                    var sIn_sp  = ((1 - y2) / eff_x2) * avgS_sp;
                    inArr.push(new KeyframeEase(sIn_sp, infIn));
                    outArr.push(new KeyframeEase(sOut_sp, infOut));
                } else {
                    for (var d = 0; d < dim; d++) {
                        var v0_d = (v0 instanceof Array) ? v0[d] : v0;
                        var v1_d = (v1 instanceof Array) ? v1[d] : v1;
                        var dy_d = v1_d - v0_d;
                        var avgS_d = (dx === 0) ? 0 : dy_d / dx;
                        var sOut_d = (y1 / eff_x1) * avgS_d;
                        var sIn_d  = ((1 - y2) / eff_x2) * avgS_d;
                        inArr.push(new KeyframeEase(sIn_d, infIn));
                        outArr.push(new KeyframeEase(sOut_d, infOut));
                    }
                }
                prop.setTemporalEaseAtKey(kIdx, prop.keyInTemporalEase(kIdx), outArr);
                prop.setTemporalEaseAtKey(kIdx + 1, inArr, prop.keyOutTemporalEase(kIdx + 1));
            }
        }
        app.endUndoGroup();
        return "OK";
    } catch(e) { return "ERROR: " + e.toString(); }
}

function arkaGraphSyncFromAE() {
    try {
        var comp = app.project.activeItem;
        if (!comp) return null;
        var props = getSelectedKeyframeProperties(comp);
        if (props.length === 0) return null;
        var prop = props[0];
        var selKeys = [];
        for (var k = 1; k <= prop.numKeys; k++) {
            if (prop.keySelected(k)) selKeys.push(k);
        }
        if (selKeys.length === 0) return null;
        var k1 = selKeys[0];
        if (k1 >= prop.numKeys && prop.numKeys > 1) k1 = k1 - 1;
        var v0 = prop.keyValue(k1);
        var v1 = prop.keyValue(k1 + 1);
        var t0 = prop.keyTime(k1);
        var t1 = prop.keyTime(k1 + 1);
        var dx = t1 - t0;
        var dy = 0;
        var isSpatial = (prop.propertyValueType == PropertyValueType.TwoD_SPATIAL || prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL);
        if (isSpatial) {
            var sum = 0;
            for (var s = 0; s < v0.length; s++) sum += Math.pow(v1[s] - v0[s], 2);
            dy = Math.sqrt(sum);
        } else {
            var val0 = (v0 instanceof Array) ? v0[0] : v0;
            var val1 = (v1 instanceof Array) ? v1[0] : v1;
            dy = val1 - val0;
        }
        var avgS = (dx === 0) ? 0 : dy / dx;
        var easeOut = prop.keyOutTemporalEase(k1)[0];
        var easeIn = prop.keyInTemporalEase(k1 + 1)[0];
        var x1 = easeOut.influence / 100;
        var x2 = 1 - (easeIn.influence / 100);
        var y1 = x1;
        var y2 = x2;
        if (Math.abs(avgS) > 0.0001) {
            y1 = (easeOut.speed / avgS) * x1;
            y2 = 1 - (easeIn.speed / avgS) * (1 - x2);
        } else {
            y1 = 0;
            y2 = 1;
        }
        y1 = Math.max(-5, Math.min(5, y1));
        y2 = Math.max(-5, Math.min(5, y2));
        if (isNaN(y1) || !isFinite(y1)) y1 = x1;
        if (isNaN(y2) || !isFinite(y2)) y2 = x2;
        return JSON.stringify({ x1: x1, y1: y1, x2: x2, y2: y2 });
    } catch(e) { return null; }
}

function arkaGraphApplyExpression(expressionCode) {
    try {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) return "ERROR: No active composition.";
        var selectedProps = getSelectedKeyframeProperties(comp);
        if (selectedProps.length === 0) return "ERROR: No properties selected.";
        app.beginUndoGroup("ArkaGraph: Apply Expression");
        for (var p = 0; p < selectedProps.length; p++) {
            try { selectedProps[p].expression = expressionCode; } catch(ee) {}
        }
        app.endUndoGroup();
        return "OK: Expression applied.";
    } catch(e) { return "ERROR: " + e.toString(); }
}

function arkaGraphClearExpression() {
    try {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) return "ERROR: No active composition.";
        var selectedProps = getSelectedKeyframeProperties(comp);
        app.beginUndoGroup("ArkaGraph: Clear Expression");
        for (var p = 0; p < selectedProps.length; p++) {
            selectedProps[p].expression = "";
        }
        app.endUndoGroup();
        return "OK";
    } catch(e) { return "ERROR: " + e.toString(); }
}

function arkaGraphGetFPS() {
    try { return String(app.project.activeItem.frameRate); } catch(e) { return "24"; }
}

function getSelectedKeyframeProperties(comp) {
    var result = [];
    var layers = comp.selectedLayers;
    if (!layers || layers.length === 0) return result;
    for (var l = 0; l < layers.length; l++) { collectSelectedProps(layers[l], result); }
    return result;
}

function collectSelectedProps(group, result) {
    for (var i = 1; i <= group.numProperties; i++) {
        var prop = group.property(i);
        if (!prop) continue;
        if (prop.numProperties > 0) {
            collectSelectedProps(prop, result);
        } else if (prop.isTimeVarying && prop.selected && prop.numKeys >= 2) {
            result.push(prop);
        }
    }
}

function arkaGraphClampBakeCount(value, minValue, maxValue) {
    return Math.max(minValue, Math.min(maxValue, value));
}

function arkaGraphGetAdaptiveBakeCount(duration, frameRate, requestedSteps, segmentCount) {
    var safeRequested = arkaGraphClampBakeCount(Math.round(requestedSteps || 30), 6, 120);
    var durationFrames = Math.max(2, Math.round(duration * frameRate) + 1);
    var hardCap = 48;
    var perPropertyBudget = 240;
    var segmentBudget = Math.max(6, Math.floor(perPropertyBudget / Math.max(1, segmentCount)));
    return Math.max(2, Math.min(safeRequested, durationFrames, hardCap, segmentBudget));
}

function arkaGraphBakeKeys(samplesJSON, optionsJSON) {
    try {
        var samples = JSON.parse(samplesJSON);
        var options = JSON.parse(optionsJSON) || {};
        if (typeof options === "number") {
            options = { requestedSteps: options };
        }
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) return "ERROR: No active composition.";
        var selectedProps = getSelectedKeyframeProperties(comp);
        if (selectedProps.length === 0) return "ERROR: No properties selected.";
        app.beginUndoGroup("ArkaGraph: Bake Keys");
        var totalInsertedKeys = 0;

        for (var p = 0; p < selectedProps.length; p++) {
            var prop = selectedProps[p];
            if (prop.numKeys < 2) continue;

            var selKeys = [];
            for (var k = 1; k <= prop.numKeys; k++) {
                if (prop.keySelected(k)) selKeys.push(k);
            }

            if (selKeys.length === 0) {
                for (var k = 1; k <= prop.numKeys; k++) selKeys.push(k);
            }

            var segments = [];
            for (var i = 0; i < selKeys.length - 1; i++) {
                var kA = selKeys[i];
                var kB = selKeys[i + 1];
                segments.push({
                    startTime: prop.keyTime(kA),
                    endTime:   prop.keyTime(kB),
                    startVal:  prop.keyValue(kA),
                    endVal:    prop.keyValue(kB)
                });
            }

            for (var i = selKeys.length - 2; i >= 0; i--) {
                var kA = selKeys[i];
                var kB = selKeys[i + 1];
                for (var k = prop.numKeys; k >= 1; k--) {
                    var kt = prop.keyTime(k);
                    if (kt > prop.keyTime(kA) + 0.0001 && kt < prop.keyTime(kB) - 0.0001) {
                        prop.removeKey(k);
                    }
                }
            }

            for (var si = 0; si < segments.length; si++) {
                var seg       = segments[si];
                var startTime = seg.startTime;
                var endTime   = seg.endTime;
                var startVal  = seg.startVal;
                var endVal    = seg.endVal;
                var duration  = endTime - startTime;
                var segmentSteps = arkaGraphGetAdaptiveBakeCount(duration, comp.frameRate, options.requestedSteps, segments.length);

                for (var i = 1; i < segmentSteps - 1; i++) {
                    var sampleIndex = Math.min(
                        Math.round(i / (segmentSteps - 1) * (samples.length - 1)),
                        samples.length - 1
                    );
                    var s    = samples[sampleIndex];
                    var time = startTime + s.t * duration;
                    if (time <= startTime + 0.0001 || time >= endTime - 0.0001) {
                        continue;
                    }
                    var val;
                    if (startVal instanceof Array) {
                        val = [];
                        for (var j = 0; j < startVal.length; j++) {
                            val.push(startVal[j] + (endVal[j] - startVal[j]) * s.v);
                        }
                    } else {
                        val = startVal + (endVal - startVal) * s.v;
                    }
                    prop.setValueAtTime(time, val);
                    totalInsertedKeys++;
                }

                try {
                    var idxA = prop.nearestKeyIndex(startTime);
                    prop.setInterpolationTypeAtKey(idxA, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
                } catch(e) {}
                try {
                    var idxB = prop.nearestKeyIndex(endTime);
                    prop.setInterpolationTypeAtKey(idxB, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
                } catch(e) {}
            }
        }

        app.endUndoGroup();
        return "OK: Smart bake applied (" + totalInsertedKeys + " generated keys)";
    } catch(e) { return "ERROR: " + e.toString(); }
}

if (typeof JSON !== "object") { JSON = {}; }
if (typeof JSON.parse !== "function") {
    JSON.parse = function(str) {
        if (!str || str === "") return null;
        try { return eval("(" + str + ")"); } catch(e) { return null; }
    };
}
if (typeof JSON.stringify !== "function") {
    JSON.stringify = function(obj) {
        if (obj === null) return "null";
        if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
        if (typeof obj === "string") return '"' + obj.replace(/\\/g,"\\\\").replace(/"/g,'\\"') + '"';
        if (obj instanceof Array) {
            var items = [];
            for (var i = 0; i < obj.length; i++) items.push(JSON.stringify(obj[i]));
            return "[" + items.join(",") + "]";
        }
        if (typeof obj === "object") {
            var pairs = [];
            for (var k in obj) { if (obj.hasOwnProperty(k)) pairs.push('"' + k + '":' + JSON.stringify(obj[k])); }
            return "{" + pairs.join(",") + "}";
        }
        return "null";
    };
}
