// JGL Server side code
// * You should not need to modify this *

// The JGL server deals with saving data, tracking participants, and
// passing files to the client-side code. This uses node, express, and 
// socket.io

// Requirements
var app = require('express')();
var http = require('http').Server(app);
var jsonfile = require('jsonfile');
var api = require('mturk-api');
var mkdirp = require('mkdirp');
var fs = require('fs');

const options = {
    key: fs.readFileSync("/private/etc/apache2/gru.key"),
    cert: fs.readFileSync("/private/etc/apache2/gru_stanford_edu_cert.cer")
};

var https = require('https').Server(options, app);
var io = require('socket.io')(https);
//////////////////////////////////////////////////////////////////////////////
//////////////////////// SECURITY FUNCTIONS ////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

var helmet = require('helmet')
app.use(helmet())
app.use(helmet.frameguard({
      action: 'allow-from',
      domain: 'https://workersandbox.mturk.com'
}));
//////////////////////////////////////////////////////////////////////////////
//////////////////////// APP FUNCTIONALITY FUNCTIONS ////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//
//// GET function
app.get( '/*' , function( req, res ) {
    // this is the current file they have requested
    var file = req.params[0]; 
    console.log('\t :: Express :: file requested: ' + file);    

    // give them what they want
    res.sendFile(__dirname + '/' + file);
}); 

io.on('connection', function(socket){
  console.log('Connection: ID ' + socket.id);

  socket.on('disconnect', function() {try {logout(socket.id);} catch(err) {console.log(err);}});

  socket.on('login', function(msg) {try {login(socket.id,msg);} catch(err) {console.log(err);}});

  socket.on('check', function() {try {io.to(socket.id).emit('check','');} catch(err) {console.log(err);}});

  socket.on('update', function() {try {update(socket.id);} catch(err) {console.log(err);}});

  socket.on('data', function(dat) {try {data(socket.id,dat);} catch(err) {console.log(err);}});

  socket.on('submit', function() {try {complete(socket.id);} catch(err) {console.log(err);}});

  socket.on('block', function(num) {try {block(socket.id,num);} catch(err) {console.log(err);}});

  socket.on('vlogin', function(hash) {try {viewerLogin(socket.id,hash);} catch(err) {console.log(err);}});
  
  socket.on('vinfo', function() {try {viewerInfo(socket.id);} catch(err) {console.log(err);}});
});

//////////////////////////////////////////////////////////////////////////////
//////////////////////// NODE FUNCTIONS ////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function login(id,msg) {
  console.log('Connection: ID ' + id);
  // Login is exp.hash

  msg = msg.split('.');
  var experiment = msg[0], // name of experiment
    hash = msg[1],
    assignmentId = msg[2];

  // Save info by socket id so we can pull it up later if we need to
  info[id] = {experiment:experiment,hash:hash,assignmentId:assignmentId};

  // check if experiment is available
  if (JGL[experiment]==undefined) {
    JGL[experiment] = {};
  }
  // check for existing state
  if (JGL[experiment][hash]==undefined) {
    // participant has never done this experiment before
    JGL[experiment][hash] = {}
    JGL[experiment][hash].connected = true;
    JGL[experiment][hash].submitted = false;
    JGL[experiment][hash].block = 0;
    JGL[experiment][hash].data = [];
  } else {
    // participant already started experiment and is re-connecting
    JGL[experiment][hash].connected = true;

    console.log('Sending start signal to ' + id + ' for block ' + JGL[experiment][hash].block);
  }

  if (JGL[experiment][hash].submitted) {
    console.log('ID: ' + id + ' already submitted');
    io.to(id).emit('submitted',true);
  } else {  
    // Note: we send -1, so that it increments to the right block
    io.to(id).emit('update',JGL[experiment][hash].block-1); // send the client its block state
  }
}

function logout(id) {
  console.log('Disconnection: ID ' + id);

  if (info[id]!=undefined) {
    if (info[id]===true) {
      delete info[id];
    } else {
      JGL[info[id].experiment][info[id].hash].connected = false;
    }
  }
}

function update(id) {
  if (info[id]!=undefined) {
    console.log('Sending update info: ID ' + id);
    var block = JGL[info[id].experiment][info[id].hash].block;
  }
}

function data(id,data) {
  console.log('ID ' + id + ' sent data for their current block');
  // if (JGL[info[id].experiment][info[id].hash].block) {
  //   console.log('WARNING: ' + id + ' sent data without incrementing their block counter');
  // }
  // Rather than store data on the server we're going to save it immediately
  var exp = info[id].experiment;
  var hash = info[id].hash;
  saveData_(exp,hash,data);
  console.log('ID ' + id + ' data from block was saved successfully.');

  // JGL[info[id].experiment][info[id].hash].data.push(data);
  // console.log(JGL[info[id].experiment][info[id].hash].data);
}

function block(id,block) {
  console.log('ID ' + id + ' is starting block '+ block);
  JGL[info[id].experiment][info[id].hash].block = block;
}

function complete(id) {
  // Signal sent when a subject has completed their experiment
  JGL[info[id].experiment][info[id].hash].submitted=true;
  saveData();
  JGL[info[id].experiment][info[id].hash].data = {};
}


// ///////////////////////////////////////////////////////////////////////
// //////////////////////// JGL FUNCTIONS ////////////////////////////////
// ///////////////////////////////////////////////////////////////////////

var JGL = {};
var info = {};

var jglFile = 'JGL.json',
  infoFile = 'info.json';

function saveState() {
  // Save the state of the JGL object but NOT the data: key for a correct shutdown
  jsonfile.writeFile(jglFile,JGL,function(err) {console.log(err);});
  jsonfile.writeFile(infoFile,info,function(err) {console.log(err);});
}

function loadState() {
  JGL = jsonfile.readFileSync(jglFile);
  info = jsonfile.readFileSync(infoFile);
}

function saveData_(exp,subj,data) {
  // Save ./exp/subj/data.json 
  var tfolder = 'data/'+exp+'/';
  mkdirp(tfolder);
  var folder = tfolder+subj+'/';
  mkdirp(folder);
  var file = folder+'data_'+Date.now()+'.json';
  jsonfile.writeFile(file,data,function(err) {console.log(err);});
}


// ///////////////////////////////////////////////////////////////////////
// ///////////////////// VIEWER FUNCTIONS ////////////////////////////////
// ///////////////////////////////////////////////////////////////////////

let viewerChanged = false;

function viewerLogin(id,hash) {
  var vInfo = jsonfile.readFileSync('hash.json');
  if (hash==vInfo.hash) {
    // Succesful login (correct password)
    // store that this ID is allowed to access viewer functions
    info[id] = true;
    io.to(id).emit('vlogin');
  }
}

function viewerInfo(id) {
  if (info[id]===true) {
    io.to(id).emit('vJGL',JGL);
    io.to(id).emit('vinfo',info);
    console.log(info);
  }
}

///////////////////////////////////////////////////////////////////////
//////////////////////// MTURK FUNCTIONS //////////////////////////////
///////////////////////////////////////////////////////////////////////

// let config;

// function loadMTurkAPI() {
//   config = jsonfile.readFileSync('auth.json');
//   enableSandbox();

//   createHIT('rt');
// }

// function enableProduction() {
//   config.sandbox = false;
//   console.log('WARNING: Production mode enabled');
// }

// function enableSandbox() {
//   config.sandbox = true;
//   console.log('Sandbox mode enabled');
// }

// // HIT information
// // Each HIT has:
// //   HIT.experiment - experiment name
// //   HIT.hitID
// //   HIT.assignments
// //   HIT.settings. {title, description, keywords, url, frame_height, duration, delay, reward, quals}
// var HITs = {};

// // Save the HIT object
// function saveHIT() {

// }

// // Load the HIT object
// function loadHIT() {

// }

// /**
// * Create a new HIT 
// */
// function createHIT(exp) {
//   //Import an XML file. You can use one of our examples in the templates folder *
//   let params = jsonfile.readFileSync('./exps/'+exp+'/settings.json');


//   params = parseExternal_(params);

//   console.log(params);

//   delete params.qualifications;
  
//   api.req('CreateHIT', params).then(function(res){
//     console.log('Created HIT? Check sandbox');
//   }).catch(console.error);
    
// }

// function parseExternal_(params) {
//   params.ExternalQuestion = "<ExternalQuestion xmlns=http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd>" +
//     "<ExternalURL>"+params.url+"</ExternalURL>"+
//     "<FrameHeight>"+params.frame_height+"</FrameHeight>"+
//     "</ExternalQuestion>";

//   delete params.url;
//   delete params.frame_height;

//   return params;
// }

// // Creates actual 9-person batches and tracks them correctly
// function createHITbatch() {

// }

// function updateHIT() {

// }

// function addHITassignments() {

// }

// function addHITtime() {

// }

// function expireHIT() {

// }

// // Overall status
// function status() {

// }

// // Individual HIt status
// function statusHIT() {

// }

// function history() {

// }

// // Reset the HIT tracking file (HIT.json)
// function eraseHistory() {

// }

var port = 8080;
//var port = 4043;
//var port = 8043;
https.listen(port, function(){
  console.log('Server live on *: ' + port);
  // loadMTurkAPI();
});
