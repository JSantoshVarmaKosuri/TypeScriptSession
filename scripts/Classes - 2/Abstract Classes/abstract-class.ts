(function() {
    //class blueprint only
   abstract class Project {
        projectName: string;
        budget: number = 2000;

        abstract changeName(name: string): void;

        calcBudget = (weeks: number):number => this.budget * weeks;
   };

   // use abstract class
   class ITProject extends Project {
        name:string = "Default"

        // the below definition also works but is not recognised by TS Lint
        // changeName = (name: string): void => {
        //     this.name = name;
        // }

        changeName(name: string): void {
            this.name = name;
        }
   };

   let newProject = new ITProject();
   console.log(newProject.name);
   newProject.changeName("OPS");
   console.log(newProject.name);
   console.log(newProject.calcBudget(2));
})();
