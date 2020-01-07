// This is the ad logic. You shouldn't need to edit this unless you're running your server somewhere other than the gru.stanford.edu server (which you shouldn't do).

let debug;

$(document).ready(function() {launch();});

function launch() {
	debug = getQueryVariable('debug')=='1';
	if (debug) {
		$("#preview").show();
		$("#active").show();
	} else if (turk.previewMode) {
		$("#preview").show();
		$("#active").hide();
	} else if (!turk.previewMode) {
		$("#preview").hide();
		$("#active").show();
	}

	// add debug tracker
	document.addEventListener('keypress',checkBackup,false);
};

let experimentWindow,path,expName;

//let server = 'localhost:8080';
//let server = 'gru.stanford.edu:4043';
let server = 'jgl-texture.herokuapp.com:8080';

function openwindow() {
	path = location.pathname;
	expName = path.substr(path.indexOf('ad-')+3,path.indexOf('.html')-(path.indexOf('ad-')+3));
	if (debug) {	
		experimentWindow = window.open('http://'+server+'/exp.html?exp='+expName+'&debug=1','Popup','toolbar=no,status=no,menubar=no,scrollbars=yes,resizable=no,width='+1024+',height='+768+'');
	} else {
		experimentWindow = window.open('http://'+server+'/exp.html?exp='+expName,'Popup','toolbar=no,status=no,menubar=no,scrollbars=yes,resizable=no,width='+1024+',height='+768+'');
	}
}

function submit() {
	var dataPackage = {
		turk:turk,
		path:path,
		expName:expName,
		success:true
	}
	experimentWindow.close();
	turk.submit(dataPackage);
	showSubmit();
}

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

function showSubmit() {
	$("#preview").hide();
	$("#active").hide();
	$("#emergency").hide();
	$("#submit").show();
}

codes = [98,97,99,107,117,112]
ci = 0;

function checkBackup(event) {
	if (event.keyCode==codes[ci]) {ci++;} else {ci=0;}
	if (ci>=codes.length) {
		$("#preview").hide();
		$("#active").hide();
		$("#emergency").show();
		ci = -1000;
	}
}

function submitBackupCode() {
	console.log('User requested to submit a backup code');

	// The backup hash codes would be hard to reverse engineer
	let hash = md5.apply($("#bcode").val());

	// Compare the hash against available backup code values 
	for (var bi=0; bi<backupcodes.length;bi++) {
		if (hash==backupcodes[bi]) {
			var dataPackage = {
				turk:turk,
				path:path,
				expName:expName,
				backup:hash,
				success:true
			}
			turk.submit(dataPackage);
			showSubmit();
		}
	}
}
