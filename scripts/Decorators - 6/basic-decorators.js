var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function () {
    function SampleDecorator(constructorFn) {
        console.log(constructorFn);
    }
    ;
    var Person = (function () {
        function Person() {
            console.log("Person Loaded");
        }
        Person = __decorate([
            SampleDecorator
        ], Person);
        return Person;
    }());
    ;
    //Factory Decorator
    var setDecorator = function (value) { return value ? SampleDecorator : null; };
    var Bus = (function () {
        function Bus() {
        }
        Bus = __decorate([
            setDecorator(true)
        ], Bus);
        return Bus;
    }());
    ;
    var Plane = (function () {
        function Plane() {
        }
        Plane = __decorate([
            setDecorator(false)
        ], Plane);
        return Plane;
    }());
    ;
    //Advanced Decorator 
    var CustomDecorator = function (constructorFn) {
        constructorFn.prototype.display = function () { return console.log("This is CustomDecorator"); };
    };
    var CustomClass = (function () {
        function CustomClass() {
        }
        CustomClass = __decorate([
            CustomDecorator
        ], CustomClass);
        return CustomClass;
    }());
    ;
    var customClass = new CustomClass();
    /* the below commneted code shuld work but there is a standing bug from type script which they are fixing for now cast it to <any>*/
    //customClass.display();
    customClass.display();
    //multiple decorators
    var CustomClass2 = (function () {
        function CustomClass2() {
        }
        CustomClass2 = __decorate([
            setDecorator(true),
            CustomDecorator
        ], CustomClass2);
        return CustomClass2;
    }());
    ;
    var customClass2 = new CustomClass();
    // the below commneted code shuld work but there is a standing bug from type script which they are fixing for now cast it to <any>
    //customClass.display();
    customClass2.display();
})();
//# sourceMappingURL=basic-decorators.js.map