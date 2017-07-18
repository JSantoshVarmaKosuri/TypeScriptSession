(function() {
    class Bank {
        // private name: string;
        // public account: string;
        // protected balance: number;

        //alternativly assing the above values
        constructor(private __name: string, public account: string, protected _balance:number){
            this.__name = __name;
            this.account = account;
            this._balance = _balance;
        };

        protected setBalance = (balance: number) => {
            this._balance += balance;
        };

        protected getBalance = () => this._balance;
    };

    var Santosh = new Bank("Santsh Varma", "ACC003456ET", 200);

    console.log(Santosh.account); //cannot access name and balance
})();