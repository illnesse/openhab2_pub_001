function round( x, p) { return(Math.round(Math.pow(10, p)*x)/Math.pow(10, p));};
(function(i) {
    return round(parseFloat(i)/1000000,0) + " MB";
})(input)