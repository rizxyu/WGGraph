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
            "var __arkaTime=time;\n" +
            "if(thisProperty.numKeys>=2){\n" +
            "var __arkaFirst=key(1).time;\n" +
            "var __arkaLast=key(thisProperty.numKeys).time;\n" +
            "var __arkaSpan=__arkaLast-__arkaFirst;\n" +
            "if(__arkaSpan>0){\n" +

            "if(__arkaTime<__arkaFirst&&(" + (isInfinite ? "true" : loopInCount + ">0") + ")){\n" +
            (isInfinite ? "" : "var __arkaMin=__arkaFirst-(__arkaSpan*" + loopInCount + ");\nif(__arkaTime>=__arkaMin){\n") +
            "var __arkaInOffset=(__arkaFirst-__arkaTime)%__arkaSpan;\n" +
            "__arkaTime=__arkaLast-__arkaInOffset;\n" +
            "if(__arkaTime>=__arkaLast)__arkaTime=__arkaFirst;\n" +
            (isInfinite ? "" : "}else{__arkaTime=__arkaFirst;}\n") +

            "}else if(__arkaTime>__arkaLast&&(" + (isInfinite ? "true" : loopOutCount + ">0") + ")){\n" +
            (isInfinite ? "" : "var __arkaMax=__arkaLast+(__arkaSpan*" + loopOutCount + ");\nif(__arkaTime<=__arkaMax){\n") +
            "var __arkaOutOffset=(__arkaTime-__arkaFirst)%__arkaSpan;\n" +
            "__arkaTime=__arkaFirst+__arkaOutOffset;\n" +
            (isInfinite ? "" : "}else{__arkaTime=__arkaLast;}\n") +
            "}\n" +
            "}\n" +
            "}\n" +
            "var time=__arkaTime;\n" +
            baseExpression
        );
    }

    root.ArkaGraphLooping = {
        clampCount: clampCount,
        wrapExpression: wrapExpression
    };
})(window);
