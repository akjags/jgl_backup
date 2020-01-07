////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////// JGL MAIN LIBRARY //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Functions that have yet to be converted are in jlg.lib.old.js

////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// JGL CORE //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* Rather than use .destroy() on PIXI.js objects we recommend calling this function. 
* This will avoid having objects that have already been destroyed get re-destroyed. 
*/
function jglDestroy(object) {
	if (object!=undefined && !object._destroyed && object.destroy!=undefined) {object.destroy();}
	object = undefined;
}

//----------------------Full screen Functions---------------------------

function checkFullScreen() {
	console.log('Not implemented');
	
	var element = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
	return element!=null;
}
function toggleFullScreen() {
	console.log('Not implemented');
	
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

function escPressed() {
	console.log('Not implemented');

	alert('The data from the current block has been dropped until you return to fullscreen.');
}

//----------------------Coordinate Functions---------------------------

/**
 * Function for changing to visual Angle Coordinates.
 * If this function is called while drawing a stencil, 
 * it does not effect the normal canvas. 
 */
function jglVisualAngleCoordinates() {
	let w = app.view.parentNode.clientWidth,
		h = app.view.parentNode.clientHeight;
	console.log('Setting 0,0 to: ' + w/2 + ', ' +h/2);
	jgl.pixi.container.setTransform(w/2, h/2);
	jgl.pixi.usingVisualAngles = true;
}


//-----------------------Text Functions------------------------

/**
 * Function to set the text params. Needs to be called right before jglTextDraw
 * @param {String} fontFamily the name of the font to use
 * @param {Number} fontSize the size of the font in *degrees*
 * @param {String} fontColor the color of the font to use (use hex format #FFFFFF)
 * @param {Number} style can be 'bold', 'italic', 'oblique'
 */
function jglTextSet(fontFamily = 'Arial', fontSize = 1, fontColor = '#ffffff', style = 'normal') {
	jgl.pixi.textStyle = new PIXI.TextStyle({
		fontFamily: fontFamily,
		fill:fontColor,
		fontSize:fontSize*jgl.screenInfo.pixPerDeg,
		fontStyle:style,
		align:'center'
	});
}

/**
 * Draws the given text starting at (x, y). Make sure to run jglTextSet first.
 * @param {String} text the text to be drawn
 * @param {Number} x the x coordinate of the beginning of the text (degs)
 * @param {Number} y the y coordinate of the beginning of the text (degs)
 * @returns {Object} a handle pointing to the text object
 */
function jglTextDraw(text, x = 0, y = 0) {
	if (jgl.pixi.textStyle==undefined) {console.log('Text drawing failure: set the style first'); return}
  let t = new PIXI.Text(text,jgl.pixi.textStyle);
  t.x = x * jgl.screenInfo.pixPerDeg; t.y = y * jgl.screenInfo.pixPerDeg;
  t.anchor.set(0.5,0.5);
  jgl.pixi.textContainer.addChild(t);
  return t;
}

//------------------- SOUNDS -------------------

function jglInitSounds() {
	alert('Sounds not setup yet');
	// jgl.sounds = {};
	// jgl.sounds.sound = {}; // actual sound dictionary
	// jgl.sounds.context = new (window.AudioContext || window.webkit.AudioContext)();
}

function jglInitTone(freq, length, name) {
	alert('Sounds not setup yet');
	// Length in ms
	// Freq in Hz
	// Name is a string
	// if (jgl.sounds===undefined) {jglInitSounds();}
	// jgl.sounds.sound[name] = {};
	// jgl.sounds.sound[name].type = 'sine';
	// jgl.sounds.sound[name].length = length;
	// jgl.sounds.sound[name].freq = freq; // value in hertz
}

function jglPlayTone(name) {
	alert('Sounds not setup yet');
	// create Oscillator node
	// var oscillator = jgl.sounds.context.createOscillator();
	// oscillator.type = jgl.sounds.sound[name].type;
	// oscillator.frequency.value = jgl.sounds.sound[name].freq; // value in hertz
	// oscillator.connect(jgl.sounds.context.destination);
	// oscillator.start();
	// oscillator.stop(jgl.sounds.context.currentTime + jgl.sounds.sound[name].length/1000);
}

//-------------------Drawing Different Shapes-------------------

/**
 * Draws a fixation cross onto the screen. 
 * If no params are given, cross defaults to center,
 * with lineWidth = 1, width = 0.1, and white.
 * @param {Number} width the width of the cross
 * @param {Number} lineWidth the width of the lines of the cross
 * @param {String} color the color in hex format
 * @param {Array} origin the center point in [x,y]
 */
function jglFixationCross(width = 1, lineWidth = 0.1, color = 0xFFFFFF, origin = [0,0]) {
	let g = new PIXI.Graphics();
	jgl.pixi.fixContainer.addChild(g);

	if (jgl.pixi.usingVisualAngles) {
		g.lineStyle(lineWidth*jgl.screenInfo.pixPerDeg,color);
		origin = multiply(origin,jgl.screenInfo.pixPerDeg);
		width = width * jgl.screenInfo.pixPerDeg;
	} else {
		g.lineStyle(lineWidth,color);
	}

	g.moveTo(origin[0]-width/2,origin[1]);
	g.lineTo(origin[0]+width/2,origin[1]);
	g.moveTo(origin[0],origin[1]-width/2);
	g.lineTo(origin[0],origin[1]+width/2);

	return g;
}

/**
 * Draws a fixation circle onto the screen. 
 * @param {Number} radius
 * @param {Number} color in binary 0xFFFFFF
 * @param {Array} origin in [0,0] format
 */
function jglFixationCircle(radius = 1,color = 0xFFFFFF,origin = [0,0]) {
	let g = new PIXI.Graphics();
	jgl.pixi.fixContainer.addChild(g);

	if (jgl.pixi.usingVisualAngles) {
		origin = multiply(origin,jgl.screenInfo.pixPerDeg);
		radius = radius * jgl.screenInfo.pixPerDeg;
	}

	g.beginFill(color);
	g.drawCircle(origin[0],origin[1],radius);

	return g;
}

/**
 * Makes Filled Rectangles
 * @param {Array} x an array of x coordinates of the centers
 * @param {Array} y an array of y coordinates of the centers
 * @param {Array} size [width,height] array
 * @param {String} color color in binary format 0x000000
 */
function jglFillRect(x, y, size, color = 0xFFFFFF) {
	if (typeof x == 'number') {
		x = [x]; y = [y];
	}
	if (x.length != y.length || size.length != 2) {
		//Error
		throw "Fill Rect: Lengths dont match"
	}
	// convert
	if (jgl.pixi.usingVisualAngles) {
		x = multiply(x,jgl.screenInfo.pixPerDeg);
		y = multiply(y,jgl.screenInfo.pixPerDeg);
		size = multiply(size,jgl.screenInfo.pixPerDeg);
	}
	// draw
	let g = new PIXI.Graphics();
	jgl.pixi.graphicsContainer.addChild(g);

	for (var i=0;i<x.length;i++) {

		g.beginFill(color);
		g.drawRect(x[i]-(size[0]/2),y[i]-(size[1]/2),size[0],size[1]);
	}

	return g;
}

//-------------------Drawing Images-------------------

// Some notes on Pixi drawing. To render things *really* fast in Pixi you need to build RenderTexture
// objects and use those. We use these to build textures for bltTexture, but you can do this too with
// other things like dots that are repeated on the screen. Anytime you draw the same thing more than
// once you should be thinking about code like this. 

// Render a circle to a texture:

// var texture = new PIXI.RenderTexture(renderer, 16, 16);
// var graphics = new PIXI.Graphics();
// graphics.beginFill(0x44FFFF);
// graphics.drawCircle(8, 8, 8);
// graphics.endFill();
// texture.render(graphics);
// Then create a sprite from the texture

// var s = new PIXI.Sprite(texture);

// You can create any number of Sprites in this way and they will be render FAR faster than if you
// generated each sprite individually. This can be useful e.g. for drawing gratings or other 
// static images more quickly. 


/**
 * Function for generating jgl textures.
 * @param {file} File to load texture from.
 * @returns the texture
 */
function jglCreateTexture(file) {
	console.log('Creating texture from: ' + file);
	let tex = PIXI.Texture.fromImage(file);
	jgl.pixi.textures.push(tex);

	return tex;
}

/**
 * Function for generating jgl textures.
 * @param {array} Array to draw texture using.
 * @returns the texture
 */
function jglCreateTextureFromArray(array) {
	console.log('Not implemented yet');
	// This code is a bit complex because Pixi doesn't have support for doing this directly. Instead
	// you need to draw to a hidden canvas and then build a texture from that. 
}

/**
 * Function for drawing the given texture to screen. All params except texture
 * are optional, defaults to center with 0 rotation.
 * @param {Object} texture the texture to draw, should only pass something
 * given by jglCreateTexture.
 * @param {Number} xpos the x-coordinate to place the center of the texture.
 * @param {Number} ypos the y-coordinate to place the center of the texture.
 * @param {Number} rotation the rotation of the texture in radians (use math.PI).
 */
function jglBltTexture(texture, xpos=0, ypos=0, rotation=0, scale=1) {
	let sprite = new PIXI.Sprite.from(texture);

	if (jgl.usingVisualAngles) {
		xpos = xpos * jgl.screenInfo.pixPerDeg;
		ypos = ypos * jgl.screenInfo.pixPerDeg;
	}
	sprite.x = xpos;
	sprite.y = ypos;
	sprite.anchor.set(0.5,0.5);
	sprite.rotation = rotation;
  sprite.scale.x = scale;
  sprite.scale.y = scale;

	jgl.pixi.graphicsContainer.addChild(sprite);
	return sprite;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// TIMING ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

let prev_tick = {};

/**
 * Get the elapsed time since the last call to this function (in ms).
 * @param {String} type is a string to let you track calls to elapsed()
 */
function elapsed(type = 'null') {
	// Returns time since the last call to elapsed
	let n = now();
	if (prev_tick[type]!=undefined) {
		let elapsed = n - prev_tick[type];
		prev_tick[type] = n;
		return elapsed;
	} else {
		prev_tick[type] = n;
		return 0;
	}
}

/**
 * Get the current time (in ms).
 */
function now() {
	return performance.now();
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////// ARRAY HELPER FUNCS ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Compare two arrays against each other. If any of their contents match at any point the function will return true.
 * @param {Array} 
 * @param {Array} or {Number}
 */
function any(array1,array2) {
	if (typeof array2 == 'number') {return any_(array1,array2);}
	// Checks if any values are equal
	for (var i=0;i<array1.length;i++) {
		for (var j=0;j<array2.length;j++) {
			if (array1[i]==array2[j]) {return true;}
		}
	}
	return false;
}

function any_(array1,value) {
	// Checks if any values are equal
	for (var i=0;i<array1.length;i++) {
		if (value==array1[i]) {return true;}
	}
	return false;
}

/**
 * Returns a random integer between 0 and n
 * @param {Number}
 */
function randomInteger(n) {
	return Math.floor(Math.random()*n);
}

/**
 * Returns a random element from the array
 * @param {Array}
 */
function randomElement(array) {
	return array[randomInteger(array.length)];
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

//--------------------- Math -----------------------

/**
 * Function to element wise multiple any combination of two arrays and / or scalars.
 * @param {Array|Number} first the first item.
 * @param {Array|Number} second the second item.
 * @returns {Array} the multiplied array.
 */
function multiply(first, second) {
	if ($.isArray(first) && $.isArray(second)) {
		if (first.length != second.length) {
			throw "array multiply, dimensions don't agree";
		}
		return jQuery.map(first, function(n, i) {
			return n * second[i];
		});
	} else if ($.isArray(first) && ! $.isArray(second)) {
		return jQuery.map(first, function(n, i) {
			return n * second;
		});
	} else if (! $.isArray(first) && $.isArray(second)) {
		return jQuery.map(second, function(n, i) {
			return n * first;
		});
	} else {
		return [first * second];
	}
}

/**
 * Determines the mean of the given array.
 * @param {Array} array the given array
 * @returns {Number} the mean value
 */
function mean(array) {
	if (array.length == 0) {
		return 0;
	}
	var sum = 0, count = 0;
	for (var i =0 ;i<array.length;i++) {
		sum += array[i];
		count++;
	}
	return sum / count;
	
}
function average(array) {return mean(array);}

////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////// HTML HELPER FUNCS /////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * If your HTML string is setup as: http(s)://yourserver:8080/exp.html?QUERY=VALUE this code will return VALUE
 * @param{String} the QUERY variable in the HTML string
 */
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////// PIXI HELPER FUNCS /////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * A Depth Container is a PIXI Container with an additional .zOrder parameter. Calling .sortChildren() on a DContainer object will ensure that the correct z-indexes are observed. This is useful e.g. for rendering a fixation cross.
 */
class DContainer extends PIXI.Container {
  addChildZ(container, zOrder) {
    container.zOrder = zOrder || 0;
    container.arrivalOrder = this.children.length;
    this.addChild(container);
    this.sortChildren();
  }
 
  sortChildren() {
    const _children = this.children;
    let len = _children.length, i, j, tmp;
    for (i = 1; i < len; i++) {
      tmp = _children[i];
      j = i - 1;
      while (j >= 0) {
        if (tmp.zOrder < _children[j].zOrder) {
          _children[j + 1] = _children[j];
        } else if (tmp.zOrder === _children[j].zOrder && tmp.arrivalOrder < _children[j].arrivalOrder) {
          _children[j + 1] = _children[j];
 
        } else {
          break;
        }
        j--;
      }
      _children[j + 1] = tmp;
    }
  };
}
