
function loadTask() {
	var task = [];
	// CONSENT
	task[0] = {};
	task[0].type = 'consent';
	// consent is a default type with no callbacks
	task[0].variables = {};
	task[0].variables.consent = NaN;
	// consent has no data

	// // SURVEY DEMOGRAPHICS
	task[1] = {};
	task[1].type = 'survey';
	// survey is a default type with no callbacks
	// the demographics survey is a default type
	task[1].surveys = ['survey-demo'];
	task[1].variables = {};
	// the default survey type needs an answer list that we can push to
	// as we get answers
	// if we don't set this it will be done automatically
	task[1].variables.answers = [];

	// // INSTRUCTIONS
	task[2] = {};
	task[2].type = 'instructions';
	// instructions is a default type with no callbacks
	// it simply displays whatever divs we specify by adding them to an instruction page and showing/hiding them in order
	task[2].variables = {};
	task[2].instructions = ['instruct-1','instruct-2','instruct-3','instruct-4','instruct-5'];

	task[3] = addTaskBlock(5,true);

	// FIRST BLOCK
	task[4] = {};
	task[4].type = 'instructions';
	// instructions is a default type with no callbacks
	// it simply displays whatever divs we specify by adding them to an instruction page and showing/hiding them in order
	task[4].variables = {};
	task[4].instructions = ['instruct-block1'];

	task[5] = addTaskBlock(10,false);

	// // SURVEY RULE
	task[6] = {};
	task[6].type = 'survey';
	task[6].surveys = ['survey-rule'];
	task[6].variables = {};
	task[6].variables.answers = [];

	jgl.active = {}; // use this for tracking what's happening

	return task;
}

function addTaskBlock(numTrials,practice) {

	// RT TRIALS
	taskblock = {};
	taskblock.type = 'trial'; // this will give us use of the canvas
	// Set minimum screen dimensions 
	taskblock.minX = 5;
	taskblock.minY = 5;
	// Setup callback functions
	taskblock.callbacks = {};
	taskblock.callbacks.startBlock = startBlock;
	taskblock.callbacks.startTrial = startTrial;
	taskblock.callbacks.startSegment = startSegment;
	taskblock.callbacks.endBlock = endBlock;
	taskblock.callbacks.updateScreen = updateScreen;
	// RT task doesn't have any parameters, but this gets auto-populated with data
	taskblock.parameters = {};
	taskblock.parameters.practice = practice;
	taskblock.parameters.match = [0, 1];
	taskblock.parameters.dir1 = [0, Math.PI*1/4, Math.PI*1/2, Math.PI*3/4, Math.PI, Math.PI*5/4, Math.PI*6/4, Math.PI*7/4];
	// RT task won't log any variables either (these get set by the user somewhere in the callbacks)
	// caution: these need a value (e.g. NaN) or they won't run correctly
	taskblock.variables = {};
	taskblock.variables.dir2 = NaN;
	taskblock.variables.nmResp = NaN;
	// Segment timing
	taskblock.segnames = ['wait','sample','delay','test','resp','iti'];
	// Seglen uses specific times
	if (practice) {
		taskblock.segmin = [Infinity,650,650,650,4000,Infinity];
		taskblock.segmax = [Infinity,650,650,650,4000,Infinity];
	} else {
		taskblock.segmin = [Infinity,650,650,650,1500,Infinity];
		taskblock.segmax = [Infinity,650,650,650,1500,Infinity];
	}
	// Responses
	taskblock.response = [0,0,0,0,1,0];
	// Backgroud color (defaults to 0.5)
	taskblock.background = 0.5;
	// If you give different keys 
	// taskblock.keys = 32;
	// Trials
	taskblock.numTrials = numTrials; // can be infinite as well
	// Keys

	return taskblock;
}

function startBlock() {
	jgl.active.dots = initDots(500,5,5,1,0,12,1);

	document.addEventListener("keydown",checkStartTrial,false);
	document.addEventListener("keyup",checkEndTrial,false);
}

function endBlock() {
	document.removeEventListener("keydown",checkStartTrial,false);
	document.removeEventListener("keyup",checkEndTrial,false);
}

function checkStartTrial(event) {
	if (event.which==32 && !jgl.active.pressed) {
		jgl.active.pressed = true;
		if (jgl.trial.segname=='wait') {
			event.preventDefault();
			jumpSegment();
		}
	}
}

function checkEndTrial(event) {
	if (event.which==32) {
		jgl.active.pressed = false;
		if ((jgl.trial.segname!='resp')&&(jgl.trial.segname!='iti')) {
			jgl.active.dead = true;
			return
		}
		if (jgl.trial.segname=='resp') {
			if (jgl.trial.responded[jgl.trial.thisseg]==0) {
				jgl.trial.responded[jgl.trial.thisseg]==1;
				jgl.trial.nmResp = 0;
				checkCorrect(jgl.trial.nmResp);
				jgl.trial.RT[jgl.trial.thisseg] = now() - jgl.timing.segment;

			}
		}
		if (jgl.trial.segname=='iti') {
			if (jgl.trial.responded[jgl.trial.thisseg-1]==0) {
				jgl.trial.responded[jgl.trial.thisseg]==1;
				jgl.trial.nmResp=1;
				checkCorrect(jgl.trial.nmResp);
				jgl.trial.RT[jgl.trial.thisseg]=0;
			}
			event.preventDefault();
			jumpSegment();
		}
	}
}

function checkCorrect(nmResp) {
	if (jgl.trial.match!=nmResp) {
		jgl.trial.correct=1;
		jgl.active.fixColor="#00ff00";
	} else {
		jgl.trial.correct=0;
		jgl.active.fixColor="#ff0000";
	}
}

function startTrial() {
	jgl.active.dead = false;
	if (jgl.trial.match) {
		jgl.trial.dir2 = jgl.trial.dir1;
	} else {
		jgl.trial.dir2 = randomElement([0, Math.PI*1/4, Math.PI*1/2, Math.PI*3/4, Math.PI, Math.PI*5/4, Math.PI*6/4, Math.PI*7/4]);
		while (jgl.trial.dir1==jgl.trial.dir2) {
			jgl.trial.dir2 = randomElement([0, Math.PI*1/4, Math.PI*1/2, Math.PI*3/4, Math.PI, Math.PI*5/4, Math.PI*6/4, Math.PI*7/4]);
		}
	}
}

function startSegment() {
	jgl.active.fix = 0;
	jgl.active.fixColor = "#ffffff";
	jgl.active.drawDots = 0;
	jgl.active.resp = 0;
	jgl.active.dir = 0;
	switch (jgl.trial.segname) {
		case 'wait':
			jgl.active.fix = 1;
			break;
		case 'sample':
			jgl.active.fix = 1;
			jgl.active.drawDots = 1;
			jgl.active.dir = jgl.trial.dir1;
			break;
		case 'delay':
			jgl.active.fix = 1;
			break;
		case 'test':
			jgl.active.fix = 1;
			jgl.active.drawDots = 1;
			jgl.active.dir = jgl.trial.dir2;
			break;
		case 'resp':
			jgl.active.fix = 1;
			jgl.active.fixColor = "#ffff00";
			break;
		case 'iti':
			if (isNaN(jgl.trial.correct)) {
				jgl.trial.responded[jgl.trial.thisseg]==1;
				jgl.trial.nmResp=1;
				checkCorrect(jgl.trial.nmResp);
				jgl.trial.RT[jgl.trial.thisseg]=0;
				jgl.active.fix = 1;
			}
			if (!jgl.active.pressed) {setTimeout(jumpSegment,1000);}
			break;
	}
}

function upResp() {
	if (jgl.trial.correct==1) {
		jgl.ctx.fillStyle = "#00ff00";
		jglTextDraw("Correct",0,0);
	} else {
		jgl.ctx.fillStyle = "#ff0000";
		jglTextDraw("Wrong",0,0);
	}
}

function updateScreen(t) {
	if (jgl.trial.practice) {
		// practice mode
		if (jgl.trial.segname=='wait') {
			jgl.ctx.fillStyle = "#ffffff";
			jglTextDraw("Hold space for next trial",0,-2.5);
		} else if (jgl.trial.segname=='resp') {
			jgl.ctx.fillStyle = "#ffffff";
			jglTextDraw("Hold or release to respond",0,-2.5);
		} else if (jgl.trial.segname=='iti' && jgl.active.pressed) {
			jgl.ctx.fillStyle = "#ffffff";
			jglTextDraw("Release for next trial",0,-2.5);
		}

		if (jgl.trial.correct===1) {
			jgl.ctx.fillStyle = "#00ff00";
			jglTextDraw("Correct response",0,2.5);
		} else if (jgl.trial.correct===0) {
			jgl.ctx.fillStyle = "#ff0000";
			jglTextDraw("Wrong response",0,2.5);
		}
	}
	if (jgl.active.fix) {jglFixationCross(jgl.screenInfo.pixPerDeg,1,jgl.active.fixColor,[0,0]);}
	if (jgl.active.drawDots) {
		updateDots(jgl.active.dots,1,jgl.active.dir,t);
		drawDots(jgl.active.dots);
	}
	if (jgl.active.resp) {
		upResp();
	}
}

// DOTS FUNCTIONALITY

// A dots drawing package for changing motion coherence

function initDots(n,maxx,maxy,coherent,dir,spd,sz) {
	if (arguments.length < 7) {
		throw new Error('Not enough arguments for initDots()');
	}
	var dots = {};
	dots.n = n;
	dots.minx = -maxx*jgl.screenInfo.pixPerDeg;
	dots.miny = -maxy*jgl.screenInfo.pixPerDeg;
	dots.maxx = maxx*jgl.screenInfo.pixPerDeg;
	dots.maxy = maxy*jgl.screenInfo.pixPerDeg;
	dots.x = zeros(n);
	dots.y = zeros(n);
	dots.coherent = [];
	dots.speed = spd * jgl.screenInfo.pixPerDeg;
	dots.size = sz;
	dots.szoff = Math.floor(dots.size/2);
	dots.dir = dir;
	for (var i=0;i<n;i++) {
		dots.x[i] = Math.random()*dots.maxx*2-dots.maxx;
		dots.y[i] = Math.random()*dots.maxy*2-dots.maxy;
		dots.coherent.push(Math.random()<=coherent);
	}
	if (!((dots.size % 2)==1)) {
		console.log('Dot size must be odd');
	}
	return dots;
}

function updateDots(dots,coherent,dir,elapsed) {
	if (typeof(dir) !== 'undefined') {dots.dir = dir;}

	var xs = Math.cos(dots.dir),
		ys = Math.sin(dots.dir),
		rate = dots.speed*elapsed/1000;
	for (var i=0;i<dots.x.length;i++) {
		dots.coherent[i] = Math.random()<coherent;
		if (!dots.coherent[i]) {
			xs = Math.cos(Math.random()*2*Math.PI);
			ys = Math.sin(Math.random()*2*Math.PI);
		}		
		dots.x[i] += xs*rate;
		dots.y[i] += ys*rate;
		if (dots.x[i]>dots.maxx) {dots.x[i] -= dots.maxx*2;}
		if (dots.y[i]>dots.maxy) {dots.y[i] -= dots.maxy*2;}
		if (dots.x[i]<(-dots.maxx)) {dots.x[i] += dots.maxx*2;}
		if (dots.y[i]<(-dots.maxy)) {dots.y[i] += dots.maxy*2;}
	}
}

function drawDots(dots) {
	jgl.ctx.save();
	jgl.ctx.beginPath();
	jgl.ctx.arc(0,0,5*jgl.screenInfo.pixPerDeg,0,Math.PI*2);
	jgl.ctx.clip();
	jglPoints2(dots.x,dots.y,5,"#ffffff");
	jgl.ctx.restore();
}
