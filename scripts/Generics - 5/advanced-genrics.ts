//built in generics
(function(){
    //Array generic
    let list: Array<number> = [12, 13, 14];

    list.push(15);
    //list.push('16');

    console.log(list);

    //variable generics with types
    let arrayFunctionGeneric = <G>(data: G[]): G[] => data;

    console.log(arrayFunctionGeneric([12, 13, 14]));
    console.log(arrayFunctionGeneric(["string0", "string1", "string2", "string3"]));

    //Generic Types
    let genericType: <G> (data: G[]) => G[] = arrayFunctionGeneric;
    console.log(genericType<string>(["string0", "string1", "string2", "string3"]));

    //generic class
    //usease in class and setting constraints
    class MathLib<G extends string | number, U extends boolean> {
        private PI: number = 3.141;
        public cosmosConstant: G;
        public isMathLib: U;

        calcTimesPI = <G extends number>(value: G) => this.PI * +value ;
    }

    var math = new MathLib<string | number, boolean>();
    math.cosmosConstant = 2.345;
    math.cosmosConstant = "2.345";
    //math.cosmosConstant = true;
    
    math.isMathLib = true;
    //math.isMathLib = "2.345";
    
    console.log(math.calcTimesPI(2));
    //console.log(math.calcTimesPI('2'));


})();