(function() {
    class Account {
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

        public getBalance = () => this._balance;
    };

    //inheritence
    class SavingAccount extends Account {
        constructor(__name: string, account: string, _balance: number, public premium: boolean) {
            //super key word is must for inheritence 
            //it must have all parameters that are need for parent constructor
            super(__name, account, _balance);
        };

        public isPremiumCustomer = () => this.premium;
    };
    
    var Santosh = new SavingAccount("Santsh Varma", "ACC003456ET", 200, false);

    console.log(Santosh.account); //cannot access name and balance
    console.log(Santosh.getBalance()); // cannot access private and protected functions
    console.log(Santosh.isPremiumCustomer()); // accessed from child class
})();
