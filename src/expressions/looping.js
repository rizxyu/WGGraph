(function (root) {
    'use strict';

    function clampCount(value) {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed < 0) {
            return 0;
        }
        return Math.min(12, parsed);
    }

    function wrapExpression(baseExpression, loopConfig) {
        const config = loopConfig || {};
        const isInfinite = !!config.infinite;
        const loopInCount = clampCount(config.inCount);
        const loopOutCount = clampCount(config.outCount);

        if (!isInfinite && loopInCount <= 0 && loopOutCount <= 0) {
            return baseExpression;
        }

        return (
            "var __wggTime=time;\n" +
            "if(thisProperty.numKeys>=2){\n" +
            "var __wggFirst=key(1).time;\n" +
            "var __wggLast=key(thisProperty.numKeys).time;\n" +
            "var __wggSpan=__wggLast-__wggFirst;\n" +
            "if(__wggSpan>0){\n" +

            "if(__wggTime<__wggFirst&&(" + (isInfinite ? "true" : loopInCount + ">0") + ")){\n" +
            (isInfinite ? "" : "var __wggMin=__wggFirst-(__wggSpan*" + loopInCount + ");\nif(__wggTime>=__wggMin){\n") +
            "var __wggInOffset=(__wggFirst-__wggTime)%__wggSpan;\n" +
            "__wggTime=__wggLast-__wggInOffset;\n" +
            "if(__wggTime>=__wggLast)__wggTime=__wggFirst;\n" +
            (isInfinite ? "" : "}else{__wggTime=__wggFirst;}\n") +

            "}else if(__wggTime>__wggLast&&(" + (isInfinite ? "true" : loopOutCount + ">0") + ")){\n" +
            (isInfinite ? "" : "var __wggMax=__wggLast+(__wggSpan*" + loopOutCount + ");\nif(__wggTime<=__wggMax){\n") +
            "var __wggOutOffset=(__wggTime-__wggFirst)%__wggSpan;\n" +
            "__wggTime=__wggFirst+__wggOutOffset;\n" +
            (isInfinite ? "" : "}else{__wggTime=__wggLast;}\n") +
            "}\n" +
            "}\n" +
            "}\n" +
            "var time=__wggTime;\n" +
            baseExpression
        );
    }

    root.WGGraphLooping = {
        clampCount: clampCount,
        wrapExpression: wrapExpression
    };
})(window);
