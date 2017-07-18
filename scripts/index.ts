import "jQuery";

$("body").css({
    "background": "red"
});

(function(){
    /*********************************** Function decorator *********************************/
    // open https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty

    const editable = (value: boolean): Function => {
        return (obj: any, prop: string, descriptor: PropertyDescriptor) => {
            descriptor.writable = value;
        }
    }

    /*********************************** Property decorator *********************************/
    const readonly = (value: boolean): Function => {
        //descriptor: PropertyDescriptor cant be accessed by TS it a technical limitation
        return (obj: any, prop: string): any => {
            let descriptor: PropertyDescriptor = {
                writable : !value
            }
            return descriptor
        }
    }

    /*********************************** Parameter decorator *********************************/
    const details = (obj: any, name: string, index: number): void => {
        console.log(obj);
        console.log(name);
        console.log(index);
    }; 

    class CustomClass {
        @readonly(true)
        public name: string;
        public hobbies: string[];
        constructor(name: string) {
            this.name = name;
            this.hobbies = ["Games", "Machine Learning"];
        }

        @editable(false)
        display(): void {
            console.log(this.name);
        };

        addHobbies(@details list: string[]):void {
            list.forEach((value, index) => {
                this.hobbies.push(value);
            });

            //using spread operator TS shows error but still works as it is a ES6 feature, provided the browser supports ES6

            //console.log(...this.hobbies);
            console.log(this.hobbies.join(' '));
        };

        
        //below code wont work even though it is a valid syntax
        //display = (): void => console.log(this.name);
    }

    let customClass = new CustomClass("Santosh Varma");
    customClass.display();

    customClass.display = (): void => console.log("Someone Else!!!");
    customClass.display();

    customClass.addHobbies(["Teaching"]);

})();