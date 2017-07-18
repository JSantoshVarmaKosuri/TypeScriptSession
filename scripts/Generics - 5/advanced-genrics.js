//built in generics
(function () {
    //Array generic
    var list = [12, 13, 14];
    list.push(15);
    //list.push('16');
    console.log(list);
    //variable generics with types
    var arrayFunctionGeneric = function (data) { return data; };
    console.log(arrayFunctionGeneric([12, 13, 14]));
    console.log(arrayFunctionGeneric(["string0", "string1", "string2", "string3"]));
    //Generic Types
    var genericType = arrayFunctionGeneric;
    console.log(genericType(["string0", "string1", "string2", "string3"]));
    //generic class
    //usease in class and setting constraints
    var MathLib = (function () {
        function MathLib() {
            var _this = this;
            this.PI = 3.141;
            this.calcTimesPI = function (value) { return _this.PI * +value; };
        }
        return MathLib;
    }());
    var math = new MathLib();
    math.cosmosConstant = 2.345;
    math.cosmosConstant = "2.345";
    //math.cosmosConstant = true;
    math.isMathLib = true;
    //math.isMathLib = "2.345";
    console.log(math.calcTimesPI(2));
    //console.log(math.calcTimesPI('2'));
})();
//# sourceMappingURL=advanced-genrics.js.map