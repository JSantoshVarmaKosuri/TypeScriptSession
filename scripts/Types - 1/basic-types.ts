(function(){
    //string
    let name: string = "Santosh Varma";

    //number
    let age: number = 27;

    //arry of any type
    let hobbies: Array<string> = ['Games', 'Machine Learning (Robotics)'];
    let hobbies1: string[] = ['Games', 'Machine Learning (Robotics)'];

    //boolean
    let married: boolean = true;

    //tuples - array of mixed types
    let address: [string, number] = ["hyderabad", 540008];

    //Any: only use as a hail mary
    let hailMary: any = "hail mary";

    //enum - set of defined states as numbers default ex: Red:0, Blue:1 etc 
    enum Channels {
        Red,
        Blue,
        GREEN,
        ALPHA
    };

    enum Other {
        Cyan = 100,
        Magenta = 101,
        Yellow = 102,
        Black = 103
    }

    let colorChannel: Channels = Channels.Red;

    //how type casting works    
    // name = 12;
    // age = "27";
    // hobbies = true;
    // married = "Yes";
    // address = [540008, "hyderabad"]
    // hailMary = { msg : "hail mary" }; 
    //let colorChannel1: Channels = Other.Cyan;

    console.log(name);
    console.log(age);
    console.log(hobbies);
    console.log(married);
    console.log(address);
    console.log(hailMary);
    console.log(colorChannel);
})();