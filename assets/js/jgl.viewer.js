// The server password is a hash stored in a secure file on the
// server. It doesn't get pushed to github. 
var socket = io();

let jgl, info;

$(document).ready(function() {launch();});

function launch() {
	document.addEventListener('keypress',keyPressed,false);

	$("#experiments").append("\<h2 id=\"login\"\>Please log in\</h2\>");
	socket.on('vlogin',function() {login();});

	socket.on('vJGL', function(jgl) {parseJGL(jgl);});
	socket.on('vinfo',function(info) {parseInfo(info);});

	// get the list of experiments
}

function tick() {
	getInfo();

	setTimeout(tick,5000);
}

function login() {
	document.removeEventListener('keypress',keyPressed,false);
	console.log('Successful login to server');
	$("#experiments").html("");
	tick();
}

function parseJGL(njgl) {
	console.log('Received JGL info: parsing');
	jgl = njgl;

	$("#experiments").html("");
	var exps = Object.keys(jgl);
	for (var e=0;e<exps.length;e++) {
		var exp = jgl[exps[e]];
		$("#experiments").append("\<h4\>"+exps[e]+ " is active\</h4\>");
		var ids = Object.keys(exp);
		for (var i=0;i<ids.length;i++) {
			var status = exp[ids[i]].connect ? 'connected' : 'disconnected',
				block = exp[ids[i]].block;
			$("#experiments").append("\<p\>"+ids[i]+ " is "+status+" on block "+block+"\</p\>");
		}
	}
}

function parseInfo(ninfo) {
	console.log('Receive info: parsing');
	info = ninfo;
	$("#connections").html("");
	var ids = Object.keys(info);
	for (var i=0;i<ids.length;i++) {
		// create a well div
		let well = document.createElement("div");
		well.className = "well well-sm";
		well.style.backgroundColor = "black";

		let h4 = document.createElement("h4");
		if (info[ids[i]]===true) {
			h4.textContent = ids[i]+ " connected as: server viewer";
		} else {
			h4.textContent = ids[i]+ " connected as: participant in "+info[ids[i]].experiment;
		}
		well.appendChild(h4);

		if (!(info[ids[i]]===true)) {
			let button = document.createElement("button");
			button.tagName = "button";
			button.className = "btn btn-default btn-lg";
			button.onClick = function() {disconnectParticipant("+ids[i]");};
			button.textContent = "disconnect";
			well.appendChild(button);
		}
		$("#connections").append(well);
	}

	populate();
}

function populate() {
	let button = document.createElement("button");
	button.tagName = "button";
	button.className = "btn btn-default btn-sm";
	button.onClick = function() {createHIT();};
	button.textContent = "Create new HIT";
	$("#experiments").append(button);
}

function getInfo() {
	socket.emit('vinfo');
}

var keys = '';
function keyPressed(event) {
	if (event.which==13) {
		var loginKey = md5(keys);
		keys = '';
		socket.emit('vlogin',loginKey);
	} else {
		keys+=event.key;
	}
}