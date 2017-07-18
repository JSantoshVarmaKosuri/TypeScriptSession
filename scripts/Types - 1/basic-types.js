(function () {
    //string
    var name = "Santosh Varma";
    //number
    var age = 27;
    //arry of any type
    var hobbies = ['Games', 'Machine Learning (Robotics)'];
    var hobbies1 = ['Games', 'Machine Learning (Robotics)'];
    //boolean
    var married = true;
    //tuples - array of mixed types
    var address = ["hyderabad", 540008];
    //Any: only use as a hail mary
    var hailMary = "hail mary";
    //enum - set of defined states as numbers default ex: Red:0, Blue:1 etc 
    var Channels;
    (function (Channels) {
        Channels[Channels["Red"] = 0] = "Red";
        Channels[Channels["Blue"] = 1] = "Blue";
        Channels[Channels["GREEN"] = 2] = "GREEN";
        Channels[Channels["ALPHA"] = 3] = "ALPHA";
    })(Channels || (Channels = {}));
    ;
    var Other;
    (function (Other) {
        Other[Other["Cyan"] = 100] = "Cyan";
        Other[Other["Magenta"] = 101] = "Magenta";
        Other[Other["Yellow"] = 102] = "Yellow";
        Other[Other["Black"] = 103] = "Black";
    })(Other || (Other = {}));
    var colorChannel = Channels.Red;
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
//# sourceMappingURL=basic-types.js.map