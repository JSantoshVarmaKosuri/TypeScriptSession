//2 ways set only get or use readonly

(function() {
    class Bank {
        // private name: string;
        // public account: string;
        // protected balance: number;

        //alternativly assing the above values
        constructor(public readonly bank: string, private __name: string, public account: string, protected _balance:number){
            this.__name = __name;
            this.account = account;
            this._balance = _balance;
        };

        protected setBalance = (balance: number) => {
            this._balance += balance;
        };

        protected getBalance = () => this._balance;
    };

    var Santosh = new Bank("CITI Bank", "Santsh Varma", "ACC003456ET", 200);

    console.log(Santosh.account); //cannot access name and balance
    Santosh.account = "Modified Account CITI346789TY";
    console.log(Santosh.account); //cannot access name and balance
    //Santosh.bank = "HDFC";
})();