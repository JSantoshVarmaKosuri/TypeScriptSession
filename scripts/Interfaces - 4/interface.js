var InterfaceSample;
(function (InterfaceSample) {
    ;
    ;
    //usease in Objects
    InterfaceSample.ComplexObject = {
        company: "Pramati",
        name: "Santosh",
        age: 27,
        display: function () {
            console.log(" Hello " + InterfaceSample.ComplexObject.name + " you are " + InterfaceSample.ComplexObject.age + ".");
        }
    };
    //usease in class
    var ComplexClass = (function () {
        function ComplexClass(company, name, age) {
            var _this = this;
            this.display = function () {
                console.log(" Hello " + _this.name + " you are " + _this.age + ". You work for " + _this.company);
            };
            this.company = company;
            this.name = name;
            this.age = age;
        }
        ;
        return ComplexClass;
    }());
    ;
    InterfaceSample.displayFromClass = function () {
        var classObj = new ComplexClass("Pramati", "Santosh Varma", 27);
        classObj.display();
    };
    //usease in side function parameters
    var complexFunction = function (data) { return console.log(data); };
    InterfaceSample.displayComplex = function () {
        var data = {
            company: "Pramati",
            name: "Santosh",
            age: 27,
            display: function () {
                console.log(" Hello " + InterfaceSample.ComplexObject.name + " you are " + InterfaceSample.ComplexObject.age + ".");
            }
        };
        console.log(complexFunction(data));
    };
    ;
    InterfaceSample.functionTypes = function (text) { return console.log(text); };
})(InterfaceSample || (InterfaceSample = {}));
InterfaceSample.ComplexObject.display();
InterfaceSample.displayFromClass();
InterfaceSample.displayComplex();
InterfaceSample.functionTypes("Function Types");
//# sourceMappingURL=interface.js.map