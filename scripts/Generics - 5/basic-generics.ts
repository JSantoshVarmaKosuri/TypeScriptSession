(function(){
    let print = (data: any) => data;

    console.log(print("String Lenth"));
    console.log(print("String Lenth").length);
    console.log(print(27));
    console.log(print(27).length);

    //can use any charaacter G, S,T, g, s, t...
    let genericPrint = <T>(data: T) => data;

    console.log(genericPrint("String Lenth"));
    console.log(genericPrint("String Lenth").length);
    console.log(genericPrint(27));
    //console.log(genericPrint(27).length);
})();