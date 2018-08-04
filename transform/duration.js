// computes nicely formatted duration from given minutes
(function(i){ 

	var d = Math.floor(i / (24 * 60));
	var h = Math.floor((i / 60) - (24 * d));
	var m = Math.round(i - 60 * (24 * d + h));
	var result = '';

	// days
	if (d === 1) {  result = result + d + ' day '; }
	else if (d > 1) {  result = result + d + ' days '; }
	
	result = result + ("00" + h).substr(-2,2) + ":" + ("00" + m).substr(-2,2);

	return result;
})(input)