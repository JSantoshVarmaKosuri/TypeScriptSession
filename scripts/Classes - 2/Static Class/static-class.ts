(function() {
    class Helpers {
        static PI: number = 3.141;

        static calcTimesPI = (value: number) => Helpers.PI * value ;
    }

    console.log(Helpers.PI);
    console.log(Helpers.calcTimesPI(2));
})();
