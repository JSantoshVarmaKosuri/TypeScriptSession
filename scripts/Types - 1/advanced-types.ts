(function(){
    /***************************  Types With Function *****************************/

    //return string 
    let returnName = function(): string {
        return "santosh";
        //return 1;
    };

    //return nothing - void
    let returnNameVoid = function(): void {
        console.log("Varma");
        //return 1;
    };

    //parameter types
    let returnNameArgs = function(name: string): string {
        return name;
    };

    console.log(returnName());
    returnNameVoid();
    console.log(returnNameArgs("Santosh Varma"));

    /***************************  Objects  *****************************/
    //object definition
    let user: { name: string, age: number } = {
        name: "Santosh Varma",
        age: 27
    };

    //advanced objects
    let advancedObject: { data: number[], output: (all: boolean) => string } = {
        data: [10, 20, 30],
        output: function(all: boolean): string {
            return this.data.join(',');
        }
    }

    //advancedObject = {}

    console.log(user);
    console.log(advancedObject.output(true));

    //custom types
        //type alias
    type AdvancedObject = { data: number[], output: (all: boolean) => number[] };

    

     
    let advancedObjectComplex: AdvancedObject = {
        data: [10, 20, 30],
        output: function(all: boolean): number[] {
            return this.data;
        }
    };
    console.log("here");
    console.log(typeof advancedObjectComplex);

    console.log(advancedObjectComplex.output(true));

    //multiple and Union types
        //example numer and string
    let realAge: number | string;

    realAge = 27;
    //realAge = '27';
    //realAge = true;

    console.log(realAge);

    //check types
    if(typeof realAge == 'number'){
        console.log(realAge + " is type number.");
    }


    //TS 2.0 never type
        // never returns - executed you are stalled and cannot continue
    function neverReturns(): never {
        throw new Error('An Error!');
        //return test;
    }

    // Nullable types - yeah null is a type now (not of much use)
        // "strictNullChecks": true in ts config
    let nullable = 12;
    let strictNull: null = null;

    // nullable = null;
    // strictNull = 12;

    let nullableUnion: number | null = 12;
    nullableUnion = null;

    console.log(nullable);
    console.log(nullableUnion);
})();