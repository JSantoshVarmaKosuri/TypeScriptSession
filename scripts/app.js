System.register("index", ["jQuery", "angular"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var angular;
    return {
        setters: [
            function (_1) {
            },
            function (angular_1) {
                angular = angular_1;
            }
        ],
        execute: function () {
            $("body").css({
                "background": "cyan"
            });
            console.log($);
            console.log(angular);
        }
    };
});
