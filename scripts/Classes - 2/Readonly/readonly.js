//2 ways set only get or use readonly
(function () {
    var Bank = (function () {
        // private name: string;
        // public account: string;
        // protected balance: number;
        //alternativly assing the above values
        function Bank(bank, __name, account, _balance) {
            var _this = this;
            this.bank = bank;
            this.__name = __name;
            this.account = account;
            this._balance = _balance;
            this.setBalance = function (balance) {
                _this._balance += balance;
            };
            this.getBalance = function () { return _this._balance; };
            this.__name = __name;
            this.account = account;
            this._balance = _balance;
        }
        ;
        return Bank;
    }());
    ;
    var Santosh = new Bank("CITI Bank", "Santsh Varma", "ACC003456ET", 200);
    console.log(Santosh.account); //cannot access name and balance
    Santosh.account = "Modified Account CITI346789TY";
    console.log(Santosh.account); //cannot access name and balance
    //Santosh.bank = "HDFC";
})();
//# sourceMappingURL=readonly.js.map