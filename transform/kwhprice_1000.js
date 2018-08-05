var pricekWh = 0.2705; //€
function round( x, p) { return(Math.round(Math.pow(10, p)*x)/Math.pow(10, p));};

(function(i) {
    var val = parseFloat(i);
    val = round(val/1000,3);
    return val +" kWh ("+round((val * pricekWh),2)+" €)";
})(input)