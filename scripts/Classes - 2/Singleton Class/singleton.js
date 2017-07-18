(function () {
    //private constructors - Singletons
    var OnlyOne = (function () {
        function OnlyOne(name) {
            this.name = name;
        }
        OnlyOne.getInstance = function () {
            if (!OnlyOne.instance) {
                OnlyOne.instance = new OnlyOne("This is Only One");
            }
            return OnlyOne.instance;
        };
        return OnlyOne;
    }());
    ;
    //let wrong = new OnlyOne("This is Only One");
    var right = OnlyOne.getInstance();
})();
//# sourceMappingURL=singleton.js.map