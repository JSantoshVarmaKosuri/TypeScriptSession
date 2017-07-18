(function() {
    //private constructors - Singletons

    class OnlyOne {
        private static instance: OnlyOne;

        private constructor(public name: string) {}

        static getInstance() {
            if(!OnlyOne.instance){
                OnlyOne.instance = new OnlyOne("This is Only One");
            }

            return OnlyOne.instance;
        }
    };

    //let wrong = new OnlyOne("This is Only One");
    let right = OnlyOne.getInstance();

})();
