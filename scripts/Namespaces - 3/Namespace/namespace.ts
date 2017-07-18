//(function(){
    
namespace CircleMath {
    const PI: number = 3.141;

    export let claculateCircumferenceOfCircle = (r: number): number => 2 * PI * r;

    export let areaOfCircle = (r: number): number => PI * r * r;
};

//})();

/////<reference path="Namespaces - 3/Namespace/namespace.ts" />

// console.log("Circumference of Circle : ", CircleMath.claculateCircumferenceOfCircle(2));
// console.log("Area of Circle : ", CircleMath.areaOfCircle(2));