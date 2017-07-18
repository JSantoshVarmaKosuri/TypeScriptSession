//(function(){
var CircleMath;
(function (CircleMath) {
    var PI = 3.141;
    CircleMath.claculateCircumferenceOfCircle = function (r) { return 2 * PI * r; };
    CircleMath.areaOfCircle = function (r) { return PI * r * r; };
})(CircleMath || (CircleMath = {}));
;
//})();
/////<reference path="Namespaces - 3/Namespace/namespace.ts" />
// console.log("Circumference of Circle : ", CircleMath.claculateCircumferenceOfCircle(2));
// console.log("Area of Circle : ", CircleMath.areaOfCircle(2)); 
//# sourceMappingURL=namespace.js.map