(function () {
    /***************************  Types With Function *****************************/
    //return string 
    var returnName = function () {
        return "santosh";
        //return 1;
    };
    //return nothing - void
    var returnNameVoid = function () {
        console.log("Varma");
        //return 1;
    };
    //parameter types
    var returnNameArgs = function (name) {
        return name;
    };
    console.log(returnName());
    returnNameVoid();
    console.log(returnNameArgs("Santosh Varma"));
    /***************************  Objects  *****************************/
    //object definition
    var user = {
        name: "Santosh Varma",
        age: 27
    };
    //advanced objects
    var advancedObject = {
        data: [10, 20, 30],
        output: function (all) {
            return this.data.join(',');
        }
    };
    //advancedObject = {}
    console.log(user);
    console.log(advancedObject.output(true));
    var advancedObjectComplex = {
        data: [10, 20, 30],
        output: function (all) {
            return this.data;
        }
    };
    console.log("here");
    console.log(typeof advancedObjectComplex);
    console.log(advancedObjectComplex.output(true));
    //multiple and Union types
    //example numer and string
    var realAge;
    realAge = 27;
    //realAge = '27';
    //realAge = true;
    console.log(realAge);
    //check types
    if (typeof realAge == 'number') {
        console.log(realAge + " is type number.");
    }
    //TS 2.0 never type
    // never returns - executed you are stalled and cannot continue
    function neverReturns() {
        throw new Error('An Error!');
        //return test;
    }
    // Nullable types - yeah null is a type now (not of much use)
    // "strictNullChecks": true in ts config
    var nullable = 12;
    var strictNull = null;
    // nullable = null;
    // strictNull = 12;
    var nullableUnion = 12;
    nullableUnion = null;
    console.log(nullable);
    console.log(nullableUnion);
})();
//# sourceMappingURL=advanced-types.js.map