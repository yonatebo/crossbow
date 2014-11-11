var km = require('./keymap.js');
var KeyListeners = {};

// sym
exports.sim = function(key, count) {
	if(count){
		for(var i=0; i<count; i++){
			process.stdout.write(km.getBuffer(key));
		}
	}
	else process.stdout.write(km.getBuffer(key));
};

exports.out = function(string){
	process.stdout.write(string);
}


// start monitoring key events
exports.capture = function() {
	process.stdin.setRawMode(true);
	process.stdin.on('data', function(data){
		var key = km.getSymbol(data);
		EmitKeyPress(key);
		if(key == '^C') process.exit();
	});
}
// register an event for the specified key
exports.on = function(key, action) {
	if(key instanceof Array){ // it's an array
		for(var i=0; i<key.length; i++){
			if(!KeyListeners[key[i]])
				KeyListeners[key[i]] = [];
			KeyListeners[key[i]].push(action);
		}
		return;
	}
	if(!KeyListeners[key])
		KeyListeners[key] = [];
	KeyListeners[key].push(action);
};
// trigger registered events for the specified key
exports.trigger = function(key, times){
	if(times){
		for(var i=0; i<times; i++){
			EmitKeyPress(key);
		}
	}
	else {
		EmitKeyPress(key);
	}
}

var colorNames = {
	black:  0,
	red: 	1,
	green: 	2,
	yellow: 3,
	blue: 	4,
	magenta:5,
	cyan: 	6,
	white:  7
}

exports.write = function(string){
	process.stdout.write(string);
}
exports.writeLine = function(string){
	process.stdout.write(string + '\n');
}
exports.blankLine = function(length){
	var string = '';
	for(var i=0; i<length; i++)
		string += ' ';
	process.stdout.write(string);
}

exports.bg = function(color) {
	if(!color)return;
	var colorCode = '\u001b[4';
	if(!parseInt(color))
		colorCode += colorNames[color];
	else colorCode += color;
	colorCode += 'm';
	process.stdout.write(colorCode);
}

exports.fg = function(color) {
	if(!color)return;
	var colorCode = '\u001b[3';
	if(!parseInt(color))
		colorCode += colorNames[color];
	else colorCode += color;
	colorCode += 'm';
	process.stdout.write(colorCode);
}

function EmitKeyPress(key){
	if(KeyListeners[key]){
		var len = KeyListeners[key].length;
		for(var i=0; i<len; i++){
			KeyListeners[key][i]();
		}
	}
}
