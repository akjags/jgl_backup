
function loadTask() {
	var task = [];
	// CONSENT
	task[0] = {};
	task[0].type = 'consent';
	// consent is a default type with no callbacks - has no data.
	task[0].variables = {};
	task[0].variables.consent = NaN;

  // INSTRUCTIONS
  task[1] = {};
  task[1].type = 'instructions';
  task[1].variables = {};
  task[1].instructions = ['instruct-1', 'instruct-2', 'instruct-3', 'instruct-4', 'instruct-5'];

	// PRACTICE TRIALS
  task[2] = addTaskBlock(5, 1);

  //Number of trials per block
  nTrialsPerBlock = 2;
  // INSTRUCTIONS BEFORE BEGINNING REAL TRIALS 
  task[3] = {};
  task[3].type = 'instructions';
  task[3].variables = {};
  task[3].instructions = ['instruct-block1'];

  // Start the real task: 20 trial blocks
  task[4] = addTaskBlock(nTrialsPerBlock, 0);

  // First break
  task[5] = {};
  task[5].type = 'instructions';
  task[5].variables = {};
  task[5].instructions = ['instruct-block2'];

  task[6] = addTaskBlock(nTrialsPerBlock, 0);

  task[7] = {};
  task[7].type = 'instructions';
  task[7].variables = {};
  task[7].instructions = ['instruct-block3'];

  task[8] = addTaskBlock(nTrialsPerBlock, 0);

  task[9] = {};
  task[9].type = 'instructions';
  task[9].variables = {};
  task[9].instructions = ['instruct-block4'];

  task[10] = addTaskBlock(nTrialsPerBlock, 0);

  task[11] = {};
  task[11].type = 'instructions';
  task[11].variables = {};
  task[11].instructions = ['instruct-block5'];

  task[12] = addTaskBlock(nTrialsPerBlock, 0);

	return task;
}

function addTaskBlock(numTrials, practice) {
  taskblock = {};
	taskblock.type = 'trial'; // this will give us use of the canvas

  // Set callback functions
	taskblock.callbacks = {};
  taskblock.callbacks.startTrial = startTrial;
	taskblock.callbacks.startSegment = startSegment;
	taskblock.callbacks.updateScreen = updateScreen;
	taskblock.callbacks.getResponse = getResponse;

  // Task parameters which get automatically assigned on each trial.
	taskblock.parameters = {};
  taskblock.parameters.practice = practice;
  
  // Task Variables which get set on each trial
	taskblock.variables = {};
	taskblock.variables.key = NaN;
  taskblock.variables.correct = NaN;
  taskblock.variables.target_position = NaN;
  taskblock.variables.img_idx = NaN;
  taskblock.variables.img_name = NaN;
  taskblock.variables.layer_idx = NaN;
  taskblock.variables.layer_name = NaN;
  taskblock.variables.pool_idx = NaN;
  taskblock.variables.poolsize = NaN;

	// Segment timing
	taskblock.segnames = ['delay','stim','feedback', 'iti'];
	taskblock.segmin = [500, 2000, 500, 500];
	taskblock.segmax = [500, 2000, 500, 500];

	// Responses - which segments should we look for a response.
	taskblock.response = [0,1,0,0];

	// Trials
	taskblock.numTrials = numTrials; // Specify number of trials according to input.

	// Keys
	taskblock.keys = [121,103,106]; // (check w/ http://keycode.info/)

  return taskblock
}

let fix, tex, texSprite, showResp, feedback_text;

function startTrial() {
  imgNames = ['face', 'jetplane', 'elephant', 'sand', 'lawn', 'dirt', 'tulips', 'fireworks', 'bananas'];
  layerNames = ['pool1', 'pool2', 'pool4'];
  pool_sizes = ['1x1', '2x2', '4x4'];

  // Randomly select an image to show on each trial.
  jgl.trial.img_idx = Math.floor(Math.random()*imgNames.length);
  jgl.trial.img_name = imgNames[jgl.trial.img_idx];

  // Randomly select a distractor layer to show on each trial
  jgl.trial.layer_idx = Math.floor(Math.random()*layerNames.length);
  jgl.trial.layer_name = layerNames[jgl.trial.layer_idx];

  // Randomly select a pooling size to show on each trial.
  jgl.trial.pool_idx = Math.floor(Math.random()*pool_sizes.length);
  jgl.trial.poolsize = pool_sizes[jgl.trial.pool_idx]; 
  console.log('Image: ' + jgl.trial.img_name + '; Layer: ' + jgl.trial.layer_name + '; pool_size: ' + jgl.trial.poolsize);

  // Randomly select the position (1,2, or 3) for the target.
  jgl.trial.target_position = Math.floor(Math.random()*3);

}


function startSegment() {
  ecc = 250; // distance from center of visual field to place images
  scl = 0.5; // scale factor to stretch / shrink images

  // Create temporary variables to track fixation color.
  jgl.active.fix = 0;
  jgl.active.fixColor = 0xFFFFFF;
  jgl.active.text = NaN;
  console.log(jgl.trial.segname);
  switch (jgl.trial.segname){
    case 'delay':
      jgl.active.fix=1;
      break; 
    case 'stim':
      jgl.active.fix=1;

      xPos = [0, -ecc*Math.cos(30*Math.PI/180), ecc*Math.cos(30*Math.PI/180)];
      yPos = [-ecc, ecc*Math.sin(30*Math.PI/180), ecc*Math.sin(30*Math.PI/180)];
      distLocs = math.setDifference([0,1,2], [jgl.trial.target_position]);

      // Load and display images
      texDir = 'exps/texOdd/color/textures';
      origDir = 'exps/texOdd/color/originals';
      distPath = texDir + '/' + jgl.trial.poolsize + '_' + jgl.trial.layer_name + '_' + jgl.trial.img_name;
      texD1 = jglCreateTexture(distPath + '_smp1.png');
      texD2 = jglCreateTexture(distPath + '_smp2.png');
      texOdd= jglCreateTexture(origDir + '/' + jgl.trial.img_name + '.png');
      texSprite1 = jglBltTexture(texD1,xPos[distLocs[0]], yPos[distLocs[0]],0, scale=scl);
      texSprite3 = jglBltTexture(texOdd,xPos[jgl.trial.target_position], yPos[jgl.trial.target_position],0, scale=scl);
      texSprite2 = jglBltTexture(texD2,xPos[distLocs[1]], yPos[distLocs[1]],0, scale=scl);

      //
      showResp = false;

      break;
    case 'feedback':
      jgl.active.fix=1;
      jglDestroy(texSprite1); jglDestroy(texSprite3); jglDestroy(texSprite2);
      if( jgl.trial.correct == 1 ){
        jgl.active.fixColor=0x00FF00; // green for correct
      } else{
        jgl.active.fixColor=0xFF0000; // red for incorrect
      }
      break;
    case 'iti':
      jgl.active.fix=1;
      jglDestroy(feedback_text);
      break;
  }
}

function updateScreen() { 
  // Draw fiation cross
  if (jgl.active.fix) {
    if (fix!=undefined){
      fix.destroy();
    }
    fix=jglFixationCross(undefined, undefined, jgl.active.fixColor,[0,0]);
  }	
  
  // Delay segment
  if (jgl.trial.segname == 'delay') {
  }


  // Stimulus segment

  // Feedback segment (draw text feedback to screen)
  if (jgl.trial.segname == 'feedback' && !showResp){
    showResp = true;
    if (jgl.trial.correct == 1){
      jglTextSet('Arial', 1, '#00ff00');
      feedback_text=jglTextDraw("Correct response",0,-2);
      jgl.active.fixColor=0x00FF00;
    } else {
      jglTextSet('Arial', 1, '#ff0000');
      feedback_text=jglTextDraw('Incorrect response', 0, -2);
      jgl.active.fixColor=0xFF0000;
    }
  }
}

function getResponse() {
  taskblock = addTaskBlock(1,1);
	jgl.trial.key = jgl.event.key.keyCode;
  //console.log(jgl.trial.key);
  //console.log(taskblock.keys[jgl.trial.target_position]);
  if (jgl.trial.key == taskblock.keys[jgl.trial.target_position]) {
    console.log('Correct');
    jgl.trial.correct = 1;
    jumpSegment();
  }
  else{
    console.log('Incorrect :(');
    jgl.trial.correct = 0;
    jumpSegment();
  }
}
