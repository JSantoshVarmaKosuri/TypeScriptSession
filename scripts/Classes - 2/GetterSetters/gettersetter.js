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
    var Account = (function () {
        // private name: string;
        // public account: string;
        // protected balance: number;
        //alternativly assing the above values
        function Account(__name, account, _balance) {
            this.__name = __name;
            this.account = account;
            this._balance = _balance;
            this.__name = __name;
            this.account = account;
            this._balance = _balance;
        }
        ;
        Object.defineProperty(Account.prototype, "balance", {
            get: function () {
                return this._balance;
            },
            set: function (balance) {
                this._balance += balance;
            },
            enumerable: true,
            configurable: true
        });
        ;
        return Account;
    }());
    ;
    //inheritence
    var SavingAccount = (function (_super) {
        __extends(SavingAccount, _super);
        function SavingAccount(__name, account, _balance, premium) {
            var _this = 
            //super key word is must for inheritence 
            //it must have all parameters that are need for parent constructor
            _super.call(this, __name, account, _balance) || this;
            _this.premium = premium;
            _this.getBalance = function () { return _this.balance; };
            _this.isPremiumCustomer = function () { return _this.premium; };
            return _this;
        }
        ;
        return SavingAccount;
    }(Account));
    ;
    var Santosh = new SavingAccount("Santsh Varma", "ACC003456ET", 200, false);
    console.log(Santosh.account); //cannot access name and balance
    console.log(Santosh.getBalance()); // cannot access private and protected functions
    console.log(Santosh.isPremiumCustomer()); // accessed from child class
})();
//# sourceMappingURL=gettersetter.js.map