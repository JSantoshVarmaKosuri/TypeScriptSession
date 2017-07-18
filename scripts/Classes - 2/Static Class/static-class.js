(function () {
    var Helpers = (function () {
        function Helpers() {
        }
        Helpers.PI = 3.141;
        Helpers.calcTimesPI = function (value) { return Helpers.PI * value; };
        return Helpers;
    }());
    console.log(Helpers.PI);
    console.log(Helpers.calcTimesPI(2));
})();
//# sourceMappingURL=static-class.js.map