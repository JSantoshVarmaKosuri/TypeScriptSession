(function(){
    function SampleDecorator(constructorFn: Function){
       console.log(constructorFn);
    };

    @SampleDecorator
    class Person {
        constructor(){
            console.log("Person Loaded");
        }
    };

    //Factory Decorator
    let setDecorator = (value: boolean) => value ? SampleDecorator : null;

    @setDecorator(true)
    class Bus {

    };

    @setDecorator(false)
    class Plane {

    };

    //Advanced Decorator 
    let CustomDecorator = (constructorFn: Function) => {
        constructorFn.prototype.display = () => console.log("This is CustomDecorator");
    }; 

    @CustomDecorator
    class CustomClass {

    };

    const customClass = new CustomClass();
    
    /* the below commneted code shuld work but there is a standing bug from type script which they are fixing for now cast it to <any>*/

    //customClass.display();
    (<any>customClass).display();

    //multiple decorators
    @setDecorator(true)
    @CustomDecorator
    class CustomClass2 {

    };

    const customClass2 = new CustomClass();
    // the below commneted code shuld work but there is a standing bug from type script which they are fixing for now cast it to <any>
    //customClass.display();
    (<any>customClass2).display();


})();