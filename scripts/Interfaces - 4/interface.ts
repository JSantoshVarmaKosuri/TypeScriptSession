namespace InterfaceSample {

    interface ComplexParent {
        company: string;
    };

    interface Complex extends ComplexParent {
        name: string,
        age: number,
        display: () => void
    };

    //usease in Objects
    export let ComplexObject: Complex = {
        company : "Pramati",
        name : "Santosh",
        age : 27,
        display : ():void => {
            console.log(` Hello ${ComplexObject.name} you are ${ComplexObject.age}.`);
        }
    };

    //usease in class
    class ComplexClass implements Complex {
        company: string;
        name: string;
        age: number;

        constructor(company, name, age){
            this.company = company;
            this.name = name;
            this.age = age;
        };

        display =  (): void => {
            console.log(` Hello ${this.name} you are ${this.age}. You work for ${this.company}`);
        };

    };

    export let displayFromClass = () => {
        let classObj = new ComplexClass("Pramati", "Santosh Varma", 27)
        classObj.display();
    };


    //usease in side function parameters
    let complexFunction = (data: Complex): void => console.log(data);

    export let displayComplex = (): void => {
        let data = {
            company : "Pramati",
            name : "Santosh",
            age : 27,
            display : ():void => {
                console.log(` Hello ${ComplexObject.name} you are ${ComplexObject.age}.`);
            }
        };
        console.log(complexFunction(data));
    };

    //usease in function types
    interface FunctionInterface {
        (name: string): void;
    };

    export let functionTypes: FunctionInterface = (text: string) => console.log(text);
}

InterfaceSample.ComplexObject.display();
InterfaceSample.displayFromClass();
InterfaceSample.displayComplex();
InterfaceSample.functionTypes("Function Types");