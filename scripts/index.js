var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
System.register("index", ["jQuery"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            }
        ],
        execute: function () {
            $("body").css({
                "background": "red"
            });
            (function () {
                /*********************************** Function decorator *********************************/
                // open https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
                var editable = function (value) {
                    return function (obj, prop, descriptor) {
                        descriptor.writable = value;
                    };
                };
                /*********************************** Property decorator *********************************/
                var readonly = function (value) {
                    //descriptor: PropertyDescriptor cant be accessed by TS it a technical limitation
                    return function (obj, prop) {
                        var descriptor = {
                            writable: !value
                        };
                        return descriptor;
                    };
                };
                /*********************************** Parameter decorator *********************************/
                var details = function (obj, name, index) {
                    console.log(obj);
                    console.log(name);
                    console.log(index);
                };
                var CustomClass = (function () {
                    function CustomClass(name) {
                        this.name = name;
                        this.hobbies = ["Games", "Machine Learning"];
                    }
                    CustomClass.prototype.display = function () {
                        console.log(this.name);
                    };
                    ;
                    CustomClass.prototype.addHobbies = function (list) {
                        var _this = this;
                        list.forEach(function (value, index) {
                            _this.hobbies.push(value);
                        });
                        //using spread operator TS shows error but still works as it is a ES6 feature, provided the browser supports ES6
                        //console.log(...this.hobbies);
                        console.log(this.hobbies.join(' '));
                    };
                    ;
                    __decorate([
                        readonly(true)
                    ], CustomClass.prototype, "name");
                    __decorate([
                        editable(false)
                    ], CustomClass.prototype, "display");
                    __decorate([
                        __param(0, details)
                    ], CustomClass.prototype, "addHobbies");
                    return CustomClass;
                }());
                var customClass = new CustomClass("Santosh Varma");
                customClass.display();
                customClass.display = function () { return console.log("Someone Else!!!"); };
                customClass.display();
                customClass.addHobbies(["Teaching"]);
            })();
        }
    };
});
