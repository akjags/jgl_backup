
# JGL

## Installing JGL

Instructions:

(1) Clone or fork the master repository:

```
  git clone https://github.com/dbirman/jgl
```

(2) Download Node (if you do not already have it. Install NPM (node package manager). See https://www.npmjs.com/get-npm for instructions. 

(3) If any packages are missing, download the following NPM packages by running the following lines of code inside your jgl directory.

```
  npm install express --save
  npm install socket.io --save
  npm install mturk-api
```

You may have some other NPM dependencies that you have to install (e.g. mkdirp, helmet)

## Running JGL

From the top of the JGL directory, type:

```
  node jgl.server.js
```

This should open a server on port 8080, which you can connect to by going to the following link. Request your experiment via an html query string.

```
  localhost:8080/exp.html?exp=EXP_NAME
```
  
where 'EXP_NAME' is the name of a particular experiment you are requesting, which has to be organized according to the setup described below (design FAQ). If you run JGL on the server, you access it at gru.stanford.edu:8080.

To avoid generating endless debugging data files on the server, set the query string debug=1, so the full call will be 

```
  localhost:8080/exp.html?exp=dms&debug=1
```

## Overview

JGL is a graphics library for MTurk that Dan is working on, based on the original JGL (which used PsiTurk, which was annoying), which is based on MGL.

The JGL architecture involves an advertisement page, which is what the subjects see on MTurk, a server that runs locally on a machine you own (e.g. at Stanford), and a client page which actually runs the experiment. The client page is fully functional in the absence of the server, which allows us to run a debug mode for talks or for showing people what experiments look like. The way to think about the JGl server/client setup is that the client is simply a data collection function. The server tells the client what block to display, the client does this and then returns data, then waits until the next block is sent. The advantage of this architecture is that workers can connect or disconnect at any time, they can drop out or exit fullscreen, or literally do anything stupid, and the experiment will simply continue where it left off when they re-connect. Additionally data is saved progressively (per block), which guarantees that there will be no data loss even from participants who disconnect partway through an experiment.

## Callbacks

In JGL the core functionality is hidden behind callback functions (same as MGL). Creating a new experiment simply consists of writing out the task structure and writing new callback functions to generate trials, update the screen, and collect responses. All of the callbacks and any helper functions you write should end up in yourexperiment.client.js. This code, along with your advertisement page, live in a single folder. As you collect data from subjects the folder will be populated with that data. The one key difference from MGL is that JGL uses a scene graph for display, this means that most sprites and textures should not be re-drawn each update. The drawing functions are documented to help understand when you might want to do different things.

JGL encrypts the client on the client-side, guaranteeing anonymity.

The callbacks you can implement are:

== Callbacks ==
startBlock \\
startTrial \\
startSegment \\
updateScreen \\
endSegment: not implemented yet \\
endTrial \\
endBlock \\
endExp \\
\\
In JGL parameters that you want randomized (block-wise) can be set into task[i].parameters, while variables that you plan to set can be placed in task[i].variables.

The JGL server is insulated from client-side errors (e.g. from bad messages). This does mean that if a message ever drops for some reason the client will get "stuck". Fortunately, clients can simply restart their connection to the server at any time to escape this.

**A warning about JGL:** this is Dan's pet project, it isn't exactly stable! Much of the code lives in jgl.lib.old.js and is broken code from the previous jgl, I'm working on porting functions over to jgl.lib.js. The code in jgl.client and jgl.server, on the other hand, is all re-built and should be fully functional. Ask Dan for help!

## Design FAQ

Ad pages can be hosted in a github repository with pages enabled--we use this repository for that purpose (a front-facing link would be: dbirman.github.io/jgl/ads/exp/ad-exp.html)

AWS keys -- To deploy to MTurk your keys need to be in a auth.json file, an example is provided. 

All of your code goes in three files in the folder exps/yourexp/:

yourexp.client.js
yourexp_instructions.html
yourexp_surveys.html

The client code consists of a function loadTask() which builds the task list and any callbacks you need for your experiment. Keep in mind that different blocks can use different callbacks, allowing you to run different kinds of experiments.

Here's an example of how to set up a consent block:

```
  var task = [];
	// CONSENT
	task[0] = {};
	task[0].type = 'consent';
	// consent is a default type with no callbacks
	task[0].variables = {};
	task[0].variables.consent = NaN;
	// consent has no data
```

For instructions and surveys you need to include the id tags of the divs that will be displayed. For example in yourexp_instructions.html you might put this div:

```
  <div id="instruct-1">
	<p>Your task is to learn a simple rule.</p>
  </div>
```

In your loadTask() function you would then need the following code:

```
// INSTRUCTIONS
task[1] = {};
task[1].type = 'instructions';
// instructions is a default type with no callbacks
// it simply displays whatever divs we specify by adding them to an instruction page and showing/hiding them in order
task[1].variables = {};
task[1].instructions = ['instruct-1'];
```

See the RT or DMS experiments for more examples of how to construct blocks. Note that trial blocks start with a short delay "Get Ready!" which displays for 3 seconds before starting the actual trials.

## Mathjs

We load the mathjs library (http://mathjs.org/docs/). This includes functions for arrays and matrices and their manipulation. Some quick examples are shown below:

```
// create an array and a matrix/ 
const array = [[2, 0], [-1, 3]]               // Array
const matrix = math.matrix([[7, 1], [-2, 3]]) // Matrix

// perform a calculation on an array and matrix
math.square(array)                            // Array,  [[4, 0], [1, 9]]
math.square(matrix)                           // Matrix, [[49, 1], [4, 9]]

// perform calculations with mixed array and matrix input
math.add(array, matrix)                       // Matrix, [[9, 1], [-3, 6]]
math.multiply(array, matrix)                  // Matrix, [[14, 2], [-13, 8]]

// create a matrix. Type of output of function ones is determined by the
// configuration option `matrix`
math.ones(2, 3)                               // Matrix, [[1, 1, 1], [1, 1, 1]]
```

A list of useful functions:

```
math.ones(3)                        // Matrix, size [3],    [1, 1, 1]
math.range(0, 4)        // [0, 1, 2, 3]

const a = math.matrix([1, 4, 9, 16, 25])  // Matrix, [1, 4, 9, 16, 25]
math.sqrt(a)                              // Matrix, [1, 2, 3, 4, 5]

const c = [[2, 0], [-1, 3]]               // Array
const d = math.matrix([[7, 1], [-2, 3]])  // Matrix
math.multiply(c, d)                       // Matrix, [[14, 2], [-13, 8]]

math.size([0, 1, 2, 3])                       // Array, [4]
```

## Backup codes

Each experiment ad includes a file with backup codes. These are hashed from a set of private keys using the md5 library. If something goes wrong during an experiment you can create additional backup codes, push them to your repository, and then allow participants to use them to submit the HIT without needing to connect with the server. 

(1) Open your ad page. In the console type md5.apply('private_key_string') to generate hash codes. 
(2) Save the hash codes in backups.js in your ad folder. Push these to git or to your ad server.
(3) Respond to your Turker's emails by sending them one of the *private keys*. They can now submit by going to the ad page, typing the letters "b a c k u p" and then entering the private key. The HIT will submit without every connecting to the server.
(4) Clear the backups.js file and push the empty file to the server, otherwise a Turker could theoretically re-use the codes.

Notes: It would be good to prevent multiple submissions in some way, something to-do. 

## Fullscreen

It would be nice if JGL automatically went fullscreen for us. Dan is working on implementing this. We have a test page that checks if user's browsers are fullscreen compatible:

http://gru.stanford.edu/doku.php/shared/fullscreentest.html

## Eye tracking

Dan is working on implementing optional eye tracking using the WebGazer library: https://webgazer.cs.brown.edu/

## Server webpage

Dan is working on building a server page which allows you to deploy on MTurk without needing to interface with the terminal at all by using the mturk-api library. This is still a work in progress. 

## Running an Experiment 

We recommend the following sequence for running an experiment on MTurk:

  * **Alpha**: Test your code on the sandbox with yourself, and 2-3 other people. Analyze your data IN FULL. Does your entire analysis work?
  * **Beta**: Put your code on MTurk and let 3-5 Turkers do the task. It should now be trivial to analyze your data. Ignore the actual results, but make sure that all //technical// aspects functioned fine and that you have all the data you want.
  * **Full Dataset**: If both your alpha and beta were successful, collect a full dataset. I would recommend you never collect >50 Turkers of data at a time. In part because if your code fails you will have to coordinate 50 emails to get people paid.
