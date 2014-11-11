var sk = require('SimpleKeys');
var ext = require('./lib/ext.js');
var bolt = require('./bolt.js');

sk.capture();
sk.on('q', process.exit);

// Process the arguments, 0:node, 1:bow, 2:action 3:arg1
var arg = process.argv;
if(!arg[2]){ // Simply change directories
	bolt(ChangeDirectory);
} else {
	if(arg[2] == 'link'){
		bolt(LinkTarget);
	}
}

function LinkTarget(target){
	if(!arg[3]){
		console.log('create a link to ' + target);
	}
	else {
		console.log('create a link to "' + target + '" named "' + arg[3] + '"');
	}
}

function ChangeDirectory(target){
	console.log('change directory to ' + target);
}

