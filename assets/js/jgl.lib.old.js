

//-------------------Drawing Different Shapes-------------------

/**
 * Function for drawing 2D points.
 * @param {Array} x array of x coordinates
 * @param {Array} y array of y coordinates
 * @param {Number} size Size of point in degrees (diameter)
 * @param {String} color Color of points in #hex format
 */
function jglPoints2(x, y, size, color) {
	if (x.length != y.length) {
		// Error
		throw "Points2: Lengths dont match";
	}
	jgl.ctx.fillStyle=color;
	for (var i=0;i<x.length;i++) {
		jgl.ctx.beginPath();
		jgl.ctx.arc(x[i], y[i], size/2, 0, 2*Math.PI);
		jgl.ctx.fill();
	}
}

function min(array) {
	var minimum = Infinity;
	for (var i=0;i<array.length;i++) {
		if (array[i]<minimum) {minimum=array[i];}
	}
	return minimum;
}

/**
 * Function for drawing 2D Lines
 * @param {Array} x0 array of starting x coordinates
 * @param {Array} y0 array of starting y coordinates
 * @param {Array} x1 array of ending x coordinates
 * @param {Array} y1 array of ending y coordinates
 * @param {Number} size width of line in pixels
 * @param {String} color in hex format "#000000"
 */
function jglLines2(x0, y0, x1, y1, size, color) {
	if (x0.length != y0.length || x1.length != y1.length || x0.length != x1.length) {
		//Error
		throw "Lines2: Lengths dont match";
	}
	for (var i=0;i<x0.length;i++) {
		canvas.context.lineWidth = size;
		canvas.context.strokeStyle=color;
		canvas.context.beginPath();
		canvas.context.moveTo(x0[i], y0[i]);
		canvas.context.lineTo(x1[i], y1[i]);
		canvas.context.stroke();
	}
}

function jglFillOval(x, y, size, color) {
	if (x.length != y.length || size.length != 2) {
		//Error
		throw "Fill Oval: Lengths dont match";
	}
	var radius = Math.min(size[0], size[1]);
	canvas.context.save();
	canvas.context.transform(0, size[0], size[1],0,0,0);
	jglPoints2(x, y, radius, color);
	canvas.context.restore();
}

function jglFillArc(x, y, iradius, oradius, color, sAng, wAng) {
	if (x.length != y.length) {
		//Error
		throw "Fill Oval: Lengths dont match";
	}
	jgl.ctx.fillStyle=color;
	jgl.ctx.beginPath();
	jgl.ctx.arc(x*jgl.screenInfo.pixPerDeg,y*jgl.screenInfo.pixPerDeg,oradius*jgl.screenInfo.pixPerDeg,sAng,wAng,false);
	jgl.ctx.arc(x*jgl.screenInfo.pixPerDeg,y*jgl.screenInfo.pixPerDeg,iradius*jgl.screenInfo.pixPerDeg,wAng,sAng,true);
	jgl.ctx.closePath();
	jgl.ctx.fill();
}

// Initialize grating 
function jglInitGrating(name,radius,contrast, freq, sigma) {
	// Draw onto the canvas then erase
	var ppd = jgl.screenInfo.pixPerDeg;
	var radius = Math.round(radius * ppd);
	var sigma = sigma * ppd;
	// Create a new back context 
	// console.log('Warning: Gratings have a high overhead (create a new canvas), avoid using too many');
	var ghostcanvas = document.createElement('canvas');
	ghostcanvas.style.display="none";
	document.body.appendChild(ghostcanvas);
	ghostcanvas.height = ""+radius*4;
	ghostcanvas.width = ""+radius*4;
	var ctx = ghostcanvas.getContext('2d');
	// Do the drawing
	ctx.clearRect(0,0,radius*4,radius*4*ppd);
	for (var x=0;x<radius*4;x++) {
		for (var y=0;y<radius*4;y++) {
			var dist = Math.hypot(x-(radius*2),y-(radius*2));
			ctx.fillStyle = mexicanHat2D(x,dist,freq,sigma,0);
			ctx.fillRect(x,y,1,1);
		}
	}
	if (jgl.images===undefined) {jgl.images={};}
	jgl.images[name] = ghostcanvas;
}

function mexicanHat2D(x,dist,f,sigma,theta) {
	var alpha = pow(Math.exp(1),multiply(-1,divide(pow(dist,2),multiply(2,pow(sigma,2))[0])));
	var wave = Math.round(add(127.5,multiply(127.5,cos(subtract(multiply(2*Math.PI*f,x),theta)))));
	return "rgba("+wave+","+wave+","+wave+","+alpha+")";
}

function jglDrawGrating(name,x,y,theta) {
	var width = jgl.images[name].width, height = jgl.images[name].height;
	jgl.ctx.save();
	jgl.ctx.translate(x*jgl.screenInfo.pixPerDeg,y*jgl.screenInfo.pixPerDeg);
	jgl.ctx.rotate(theta);
	jgl.ctx.drawImage(jgl.images[name],-width/2,-height/2);
	jgl.ctx.restore();
}



/**
 * Function for drawing a polygon.
 * The x and y params lay out a set of points.
 * @param {Array} x the x coordinates
 * @param {Array} y the y coordinates
 * @param {String} color the color, in hex format #000000
 */
function jglPolygon(x, y, color) {
	if (x.length != y.length || x.length < 3) {
		// Error, need at least three points to
		// make a polygon.
		throw "Polygon arrays not same length";
	}
	canvas.context.fillStyle = color;
	canvas.context.strokeStyle = color;
	canvas.context.beginPath();
	canvas.context.moveTo(x[0], y[0]);
	for (var i=1;i<x.length;i++) {
		canvas.context.lineTo(x[i], y[i]);
	}
	canvas.context.closePath();
	canvas.context.fill();
//	backCtx.stroke();
}



//--------------------------Texture Functions-----------------------------------

/**
 * Function to make array starting at low,
 * going to high, stepping by step.
 * @param {Number} low The low bound of the array
 * @param {Number} step the step between two elements of the array
 * @param {Number} high the high bound of the array
 */
function jglMakeArray(low, step, high) {
	if (step === undefined) {
		step = 1;
	}
	
	if (low < high) {
		var size = Math.floor((high - low) / step);
		var array = new Array(size);
		array[0] = low;
		for (var i=1;i<array.length;i++) {
			array[i] = array[i-1] + step;
		}
		return array;
	} else if (low > high) {
		var size = Math.floor((low - high) / step);
		var array = new Array(size);
		array[0] = low;
		for (var i=1;i<array.length;i++) {
			array[i] = array[i-1] - step;
		}
		return array;
	}
	return [low];
}

function repmat(array,reps) {
	out = [];
	for (i=0;i<reps;i++) {
		out = out.concat(array);
	}
	return(out);
}

// Mean of booleans (true==1; false==0)
function boolpercent(arr) {
	var count = 0;
	for (var i=0; i<arr.length; i++) {
		if (arr[i]) { count++; } 
	}
	return 100* count / arr.length;
}

function sortIndices(array,indices) {
    var ret = zeros(array.length);

    for (var i=0;i<array.length;i++) {
        ret[i] = array[indices[i]];
    }
    return(ret);
}

/**
 * Function to adjust the contrast of a stimulus relative to the screen gamma.
 * You must set myscreen.pow via the calibration.html survey first. This function
 * returns the hex of your color.
 */
function gsc2hex(contrast) {
	// if (myscreen.pow > -1) {
	// 	con = Math.round(Math.pow(contrast,1/myscreen.pow)*255);
	// } else {
	// 	con = contrast;
	// }
	con = Math.round(contrast*255);
	conS = con.toString(16);
	if (conS.length == 1) {
		conS = conS + conS;
	}
	hex = '#' + conS + conS + conS;
	return(hex);
}













/**
 * Things that need to be at the beginning of the concatenated file.
 * This module contains mostly matlab standard library functions.
 * This includes functions to do basic array operations
 * @author Tuvia Lerea
 * @module stdlib
 */

//$.getScript("/scripts/jgllib.js");

/**
 * Function to make all elements of an array uppercase.
 * @returns {Array} the uppercase array
 */
function upper(array) {
	var tempArray = [];
	for (var i = 0;i<array.length;i++) {
		tempArray.push(array[i].toUpperCase());
	}
	return tempArray;
}

/**
 * Function to grab all properties of the given object.
 * @param {Object} object the object to get the fields from
 * @returns {Array} the array of field names
 */
function fields(object) {
	var tempArray = [];
	var i = 0;
	for (var field in object) {
		if (object.hasOwnProperty(field)) {
			tempArray[i++] = field;
		}
	}
	return tempArray;
}

/**
 * Function to make array of zeros of given length.
 * @param {Number} length the length of the array to make
 * @returns {Array} the zero array
 */
function zeros(length) {
	var tempArray = new Array(length);
	for (var i=0;i<tempArray.length;i++) {
		tempArray[i] = 0;
	}
	return tempArray;
}

/**
 * Function to make array of ones of given length.
 * @param {Number} length the length of the array to make.
 * @returns {Array} the ones array
 */
function ones(length) {
	var tempArray = new Array(length);
	for (var i=0;i<length;i++) {
		tempArray[i] = 1;
	}
	return tempArray;
}

/**
 * Function to pad the end of an array with the given value.
 * @param {Array} array the array to pad
 * @param {Number} endLength the final length the array should be
 * @param {Any} padVal the value to pad with
 * @returns {Array} the padded array
 */
function arrayPad(array, endLength, padVal) {
	while (array.length < endLength) {
		array.push(padVal);
	}
	return array;
}

/**
 * Function to make array of given length filled with the given value.
 * @param {Any} value the value to fill the array with
 * @param {Number} length the length the array should be
 * @returns {Array} the array that is made
 */
function fillArray(value, length) {
	var tempArray = new Array(length);
	for (var i=0;i<length;i++) {
		tempArray[i] = value;
	}
	return tempArray;
}

/**
 * Function to get the sum of an array
 * @param {Array} array the array to sum
 * @returns {Number} the sum of the array
 */
function sum(array) {
	var sum = 0;
	for (var i=0;i<array.length;i++) {
		sum += array[i];
	}
	return sum;
}

/**
 * Function to make cumulative sum array.
 * @param {Array} array the array to generate the cumulative sum from.
 * @returns {Array} the cumulative sum array
 */
function cumsum(array) {
	if (array.length == 0) {
		return [];
	}
	var sum = array[0];
	for (var i=0;i<array.length;i++) {
		sum += array[i];
		array[i] = sum;
	}
	return array;
}

/**
 * Function to determine if an array is empty
 * @param {Array} array the array
 * @returns {Boolean} true if array.length == 0 or given array is undefined
 */
function isEmpty(array) {
	if (array === undefined) {
		return true;
	}
	
	if (array === null) {
		return true;
	}
	if ($.isArray(array)) {
		return array.length == 0;
	}
	if (array === Infinity || array === NaN) {
		return true;
	}
	console.log("isEmpty: used with non-array");
	return false;
}

/**
 * Function to determine if there are any non-zero values in the array.
 * @param {Array} array the array to check
 * @returns {Boolean} true if there is at least one non-zero value in array
 */
function any(array) {
	for (var i =0; i< array.length;i++) {
		if (array[i] != 0) {
			return true;
		}
	}
	return false;
}

function all(array,value) {
	if (value===undefined) {var value=1;}
	for (var i=0;i<array.length;i++) {
		if (array[i]!=value) {
			return false;
		}
	}
	return true;
}

/**
 * Function to determine the number of elements in the given array
 * @param {Array} array the array to count from
 * @returns {Number} number of defined elements in the given array
 */
function numel(array) {
	var count = 0;
	for (var i=0;i<array.length;i++) {
		if (array[i] != undefined) {
			count++;
		}
	}
	return count;
}

/**
 * Function to determine where in the given array is the given string.
 * @param {String} string the string to search for. 
 * @param {Array} array the array to search through
 * @returns {Array} a logical array, 0 means the that slot in the array was not the string,
 * 1 means that slot was the string.
 */
function strcmp(string, array) {
	var tempArray = zeros(array.length);
	for (var i=0;i<array.length;i++) {
		if (string.localeCompare(array[i]) == 0) {
			tempArray[i] = 1;
		}
	}
	return tempArray;
}

/**
 * Function to calculate the element wise difference of an array.
 * @param {Array} array the array to calculate the diff from
 * @returns {Array} the diff array where diff[0] == array[1] - array[0]
 */
function diff(array) {
	var tempArray = new Array(array.length - 1);
	for (var i = 1;i<array.length;i++) {
		tempArray[i-1] = array[i] - array[i-1];
	}
	return tempArray;
}

/**
 * Function to index an array by another array.
 * @param {Array|Number} master the array to index.
 * @param {Array} slave the index array
 * @param {Boolean} logical if true, the slave is treated as a logical array, if false then not.
 * @returns {Array} the array generated by this indexing
 */
function index(master, slave, logical) {
	var tempArray = [];

	if (! $.isArray(master)) {
		for (var i=0;i<slave.length;i++) {
			if (slave[i] != 0) {
				throw "index error";
			}
			tempArray.push(master);
		}
	} else {
		if (logical) {
			for (var i=0;i<slave.length;i++) {
				if (slave[i] == 1) {
					tempArray.push(master[i]);
				}
			}
		} else {
			for (var i =0;i<slave.length;i++) {
				tempArray.push(master[slave[i]]);
			}
		}
	}
	return tempArray;
}

/**
 * Function to determine if two arrays are equal. 
 * @param {Array} first the first array
 * @param {Array} second the second array
 * @returns {Boolean} the two arrays are equal if they have the same length, and elements
 */
function isEqual(first, second) {
	if (first.length != second.length) {
		return false;
	}
	for (var i =0;i<first.length;i++) {
		if (first[i] != second[i]) {
			return false;
		}
	}
	return true;
}

/**
 * Function for returning the indices of non-zero values of an array 
 * @param {Array} array the array to search through
 * @returns {Array} an array of indices of all non-zero elements in array
 */
function find(array) {
	var tempArray = [];
	for (var i =0;i<array.length;i++) {
		if (array[i] != 0) {
			tempArray.push(i);
		}
	}
	return tempArray;
}

/**
 * Function for generating a unique array as well as indexing array. 
 * If only a unique array is desired use $.unique(A).
 * @param {Array} A the array to work with
 * @returns {Array} [C IA IC] C is the unique array and is sorted.
 * IA is such that C = index(A, IA, false)
 * IC is such that A = index(C, IC, false)
 */
function unique(A) {
	var set = new Set();
	var C = [];
	var IA = [];
	var IC = [];
	for (var i=0;i<A.length;i++) {
		if (! set.contains(A[i])) {
			set.insert(A[i]);
		}
	}
	C = set.toArray();
	C = C.sort();
	for (var i = 0;i<C.length;i++) {
		IA.push(A.indexOf(C[i]));
	}
	for (var i =0;i<A.length;i++) {
		IC.push(C.indexOf(A[i]));
	}

	return [C, IA, IC];
}

/**
 * Function for generating an array of all of a given field from an array of objects.
 * @param {Array} array the array of objects
 * @param {String} field the field name. 
 * @returns {Array} an array such that the zero'th index == array[0].field
 */
function gatherFields(array, field) {
	var tempArray = new Array(array.length);
	for (var i=0;i<tempArray.length;i++) {
		tempArray[i] = eval("array[i]." + field);
	}
	return tempArray;
}

/**
 * Function for determining where array[i] == val
 * @param {Array} array the array to search through
 * @param {Any} val the value to search for
 * @returns {Array} a logical array 1 where array[i] == val, 0 where not.
 */
function equals(array, val) {
	var temp = zeros(array.length);
	for (var i = 0;i< array.length;i++) {
		if (array[i] === val) {
			temp[i] = 1;
		}
	}
	return temp;
}

/**
 * Function to generate an array of NaNs.
 * @param {Number} length the length of the array
 * @returns {Array} and array of NaNs
 */
function nan(length) {
	return fillArray(NaN, length);
}

/**
 * Function to element wise add two arrays or an array with a scalar. 
 * Both first and second can be scalars or arrays.
 * @param {Array|Number} first the first item.
 * @param {Array|Number} second the second item.
 * @param {Array} index the indexing array defaults to ones
 * @returns {Array} the added array
 */
function add(first, second, index) {
	if ($.isArray(first) && $.isArray(second)) {
		if (first.length != second.length) {
			throw "array add, dimensions don't agree";
		}
		if (index === undefined) {
			index = ones(first.length);
		}
		return jQuery.map(first, function(n, i) {
			if (index[i]) {
				return n + second[i];
			} else {
				return n;
			}
		});
	} else if ($.isArray(first) && ! $.isArray(second)) {
		if (index === undefined) {
			index = ones(first.length);
		}
		return jQuery.map(first, function(n, i) {
			if (index[i]) {
				return n + second;
			} else {
				return n;
			}
		});
	} else if (! $.isArray(first) && $.isArray(second)) {
		if (index === undefined) {
			index = ones(second.length);
		}
		return jQuery.map(second, function(n, i) {
			if (index[i]) {
				return n + first;
			} else {
				return n;
			}		});
	} else {
		return [first + second];
	}
}

/**
 * Function to selement wise subtract two arrays or an array with a scalar.
 * Both first and second can be scalars or arrays.
 * @param {Array|Number} first the first item.
 * @param {Array|Number} second the second item.
 * @param {Array} index indexing array, defaults to ones
 * @returns {Array} the subtracted array where if one is an array and one is not,
 *  the scalar is always subtracted from each element of the array.
 */
function subtract(first, second, index) {
	if ($.isArray(first) && $.isArray(second)) {
		if (first.length != second.length) {
			throw "array add, dimensions don't agree";
		}
		if (index === undefined) {
			index = ones(first.length);
		}
		return jQuery.map(first, function(n, i) {
			if (index[i]) {
				return n - second[i];
			} else {
				return n;
			}
		});
	} else if ($.isArray(first) && ! $.isArray(second)) {
		if (index === undefined) {
			index = ones(first.length);
		}
		return jQuery.map(first, function(n, i) {
			if (index[i]) {
				return n - second;
			} else {
				return n;
			}
		});
	} else if (! $.isArray(first) && $.isArray(second)) {
		if (index === undefined) {
			index = ones(second.length);
		}
		return jQuery.map(second, function(n, i) {
			if (index[i]) {
				return n - first;
			} else {
				return n;
			}		});
	} else {
		return [first - second];
	}
}


/**
 * Function to element wise multiple any combination of two arrays and / or scalars.
 * @param {Array|Number} first the first item.
 * @param {Array|Number} second the second item.
 * @returns {Array} the multiplied array.
 */
function pow(first, second) {
	if ($.isArray(first) && $.isArray(second)) {
		if (first.length != second.length) {
			throw "array multiply, dimensions don't agree";
		}
		return jQuery.map(first, function(n, i) {
			return Math.pow(n,second[i]);
		});
	} else if ($.isArray(first) && ! $.isArray(second)) {
		return jQuery.map(first, function(n, i) {
			return Math.pow(n,second);
		});
	} else if (! $.isArray(first) && $.isArray(second)) {
		return jQuery.map(second, function(n, i) {
			return Math.pow(first,n);
		});
	} else {
		return [Math.pow(first,second)];
	}
}


/**
 * Function to element wise to divide any combination of two arrays / scalars
 * @param {Array|Number} first the first item.
 * @param {Array|Number} second the second item.
 * @returns {Array} the divided array. if a scalar is involved, each element of the array is divided by the scalar. 
 */
function divide(first, second) {
	if ($.isArray(first) && $.isArray(second)) {
		if (first.length != second.length) {
			throw "array divide, dimensions don't agree";
		}
		return jQuery.map(first, function(n, i) {
			return n / second[i];
		});
	} else if ($.isArray(first) && ! $.isArray(second)) {
		return jQuery.map(first, function(n, i) {
			return n / second;
		});
	} else if (! $.isArray(first) && $.isArray(second)) {
		return jQuery.map(second, function(n, i) {
			return n / first;
		});
	} else {
		return [first / second];
	}
}

/**
 * Function to floor a scalar or array.
 * @param {Array|Number} val the value to floor, can be an array or scalar
 * @returns {Number|Array} if a number was given, the floor is returned.
 * if an array was given, an array of floored values is returned. 
 */
function floor(val) {
	if ($.isArray(val)) {
		return jQuery.map(val, function(n, i) {
			return Math.floor(n);
		});
	} else {
		return Math.floor(val);
	}
}

/**
 * Function to determine if the given val is Infinite. If an array is given it works element wise through the array.
 * @param {Array|Number} val the value to check. can be a Number or Array.
 * @returns {Number|Array} Number if Number is given, returns 1 for infinite, 0 for not. If array was given, Array is returned
 * with element wise bits checking for infinity.
 */
function isinf(val) {
	if ($.isArray(val)) {
		return jQuery.map(val, function(n,i) {
			if (isFinite(n)) {
				return 0;
			}
			return 1;
		});
	} else {
		return isFinite(val) ? 0 : 1;
	}
}

/**
 * Function to determine if the given val is NaN If an array is given it works element wise through the array.
 * @param {Array|Number} val the value to check. can be a Number or an Array.
 * @returns {Number|Array} Number if Number is given, Array if Array is given. 1 means NaN, 0 means not.
 */
function isnan(val) {
	if ($.isArray(val)) {
		return jQuery.map(val, function(n,i) {
			return isNaN(n) ? 1 : 0;
		});
	}
	return isNaN(val) ? 1 : 0;
}

/**
 * Function to calculate an element bit wise or. works with logical inputs. Inputs can be Arrays or Numbers.
 * @param {Array|Number} first the first input
 * @param {Array|Number} second the second input
 * @returns {Array} returns an array of element bit wise ors of the inputs. 
 */
function or(first, second) {
	if ($.isArray(first) && $.isArray(second)) {
		if (first.length != second.length) {
			throw "array or, dimensions don't agree";
		}
		return jQuery.map(first, function(n, i) {
			return n | second[i];
		});
	} else if ($.isArray(first) && ! $.isArray(second)) {
		return jQuery.map(first, function(n, i) {
			return n | second;
		});
	} else if (! $.isArray(first) && $.isArray(second)) {
		return jQuery.map(second, function(n, i) {
			return n | first;
		});
	} else {
		return [first | second];
	}
}

/**
 * Function to calculate an element bit wise and. works with logical inputs. Inputs can be Arrays or Numbers.
 * @param {Array|Number} first the first input
 * @param {Array|Number} second the second input
 * @returns {Array} returns an array of element bit wise ands of the inputs. 
 */
function and(first, second) {
	if ($.isArray(first) && $.isArray(second)) {
		if (first.length != second.length) {
			throw "array or, dimensions don't agree";
		}
		return jQuery.map(first, function(n, i) {
			return n & second[i];
		});
	} else if ($.isArray(first) && ! $.isArray(second)) {
		return jQuery.map(first, function(n, i) {
			return n & second;
		});
	} else if (! $.isArray(first) && $.isArray(second)) {
		return jQuery.map(second, function(n, i) {
			return n & first;
		});
	} else {
		return [first & second];
	}
}

/**
 * Function to calculate an element bit wise xor. works with logical inputs. Inputs can be Arrays or Numbers.
 * @param {Array|Number} first the first input
 * @param {Array|Number} second the second input
 * @returns {Array} returns an array of element bit wise xors of the inputs. 
 */
function xor(first, second) {
	if ($.isArray(first) && $.isArray(second)) {
		if (first.length != second.length) {
			throw "array or, dimensions don't agree";
		}
		return jQuery.map(first, function(n, i) {
			return !(n & second[i]) & (n | second[i]);
		});
	} else if ($.isArray(first) && ! $.isArray(second)) {
		return jQuery.map(first, function(n, i) {
			return !(n & second[i]) & (n | second[i]);
		});
	} else if (! $.isArray(first) && $.isArray(second)) {
		return jQuery.map(second, function(n, i) {
			return !(n & second[i]) & (n | second[i]);
		});
	} else {
		return [!(n & second[i]) & (n | second[i])];
	}
}

/**
 * Function to generate a logical array from element wise checking greater than between first and second.
 * @param {Array|Number} first the first item. can be a Number or Array
 * @param {Array|Number} second the second item. can be a Number or Array
 * @returns {Array} returns a logical array. where 1 means first > second for each element of first/second
 */
function greaterThan(first, second) {
	if ($.isArray(first) && $.isArray(second)) {
		if (first.length != second.length) {
			throw "array or, dimensions don't agree";
		}
		return jQuery.map(first, function(n, i) {
			return n > second[i] ? 1 : 0;
		});
	} else if ($.isArray(first) && ! $.isArray(second)) {
		return jQuery.map(first, function(n, i) {
			return n > second ? 1 : 0;
		});
	} else if (! $.isArray(first) && $.isArray(second)) {
		return jQuery.map(second, function(n, i) {
			return first > n ? 1 : 0;
		});
	} else {
		return first > second ? [1] : [0];
	}
}

/**
 * Function to generate a logical array from element wise checking less than between first and second.
 * @param {Array|Number} first the first item. can be a Number or Array
 * @param {Array|Number} second the second item. can be a Number or Array
 * @returns {Array} returns a logical array. where 1 means first < second for each element of first/second
 */
function lessThan(first, second) {
	if ($.isArray(first) && $.isArray(second)) {
		if (first.length != second.length) {
			throw "array or, dimensions don't agree";
		}
		return jQuery.map(first, function(n, i) {
			return n < second[i] ? 1 : 0;
		});
	} else if ($.isArray(first) && ! $.isArray(second)) {
		return jQuery.map(first, function(n, i) {
			return n < second ? 1 : 0;
		});
	} else if (! $.isArray(first) && $.isArray(second)) {
		return jQuery.map(second, function(n, i) {
			return first < n ? 1 : 0;
		});
	} else {
		return first < second ? [1] : [0];
	}
}


/**
 * Function for generating a random integer.
 * @param {Object} task the task object from which to grab random numbers
 * @param {Number} low the low bound. inclusive
 * @param {Number} high the high bound, exclusive
 * @returns {Number} random integer between low and high
 */
function randInt(task, low, high) {
	return Math.round(rand(task) * (high - low - 1)) + low;
}

/**
 * Generate a random permutation from 0 - length
 * @param {Object} task the task object to grab random numbers from
 * @param {Number} length the length of the permutation, excludes length
 * @returns {Array} a random permutation from 0-length
 */
function randPerm(task, length) {
	var array = jglMakeArray(0, 1, length);
	var randy;
	for (var i = 0;i<array.length - 1;i++) {
		randy = randInt(task, i, array.length);
		var temp = array[randy];
		array[randy] = array[i];
		array[i] = temp;
	}
	return array;
}

/**
 * Generates size of given value
 * @param {Array|Number} val the value to determine size of
 * @returns {Number} the length of val if val is an array, 1 if not. 0 if null
 */
function size(val) {
	if ($.isArray(val)) {
		return val.length;
	} else if (val != undefined && val != null) {
		return 1;
	} else {
		return 0;
	}
}

/**
 * Determines the product of the given array
 * @param {Array} array the array to determine the product of
 * @returns {Number} the product
 */
function prod(array) {
	if ($.isArray(array)) {
		var product = 1;
		for (var i = 0;i<array.length;i++) {
			product *= array[i];
		}
		return product;
	}
	return 0;
}

/**
 * Generates and returns the not of the given value
 * @param {Array|Number} array the given value
 * @returns {Number|Array} for every element returns 0 if element, 1 otherwise 
 */
function not(array) {
	if (! $.isArray(array)) {
		return array ? 1 : 0;
	} else {
		var temp = new Array(array.length);
		for (var i = 0;i < array.length; i++) {
			temp[i] = array[i] ? 0 : 1;
		}
		return temp;
	}
}

/**
 * Generates a sin array of the given array.
 * @param {Array} array the array to sin
 * @returns {Array} an element wise sin array of the given array
 */
function sin(array) {
	return jQuery.map(array, function(n,i) {
		return Math.sin(n);
	});
}

/**
 * Generates a cos array of the given array.
 * @param {Array} array the array to cos
 * @returns {Array} an element wise cos array of the given array
 */
function cos(array) {
	return jQuery.map(array, function(n,i) {
		return Math.cos(n);
	});
}

/**
 * Determine if a value is numeric. 
 * @param {Array|Number} val the value to check
 * @returns {Boolean} true if single element is numeric or if all elements in
 * an array or numeric
 */
function isNumeric(val) {
	if ($.isArray(val)) {
		for (var i=0;i<val.length;i++) {
			if (! $.isNumeric(val[i])) {
				return false;
			}
		}
		return true;
	}else {
		return $.isNumeric(val);
	}
}

/**
 * Function to change only certain elements of an array.
 * @param {Array} array the array to change (original values)
 * @param {Array} values an array of new values
 * @param {Array} indexer a logical array that indicates which values in array to change
 * @returns {Array} The new changed array
 */
function change(array, values, indexer) {
	var places = find(indexer);
	if (places.length != values.length) {
		throw "change: array lengths dont match";
	}
	
	for (var i =0 ;i<places.length;i++) {
		array[places[i]] = values[i];
	}
	
	return array;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgb2hex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function gsc2hex(perc) {
	var comp = componentToHex(Math.round(perc*255));
	return "#" + comp + comp + comp;
}