var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function () {
    //class blueprint only
    var Project = (function () {
        function Project() {
            var _this = this;
            this.budget = 2000;
            this.calcBudget = function (weeks) { return _this.budget * weeks; };
        }
        return Project;
    }());
    ;
    // use abstract class
    var ITProject = (function (_super) {
        __extends(ITProject, _super);
        function ITProject() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.name = "Default";
            return _this;
        }
        // the below definition also works but is not recognised by TS Lint
        // changeName = (name: string): void => {
        //     this.name = name;
        // }
        ITProject.prototype.changeName = function (name) {
            this.name = name;
        };
        return ITProject;
    }(Project));
    ;
    var newProject = new ITProject();
    console.log(newProject.name);
    newProject.changeName("OPS");
    console.log(newProject.name);
    console.log(newProject.calcBudget(2));
})();
//# sourceMappingURL=abstract-class.js.map