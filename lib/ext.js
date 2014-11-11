//external functions to save space
var fs = require('fs');
var config = require('../config.json');
var ext = module.exports;
ext.GetFileType = function(path) {
	var stat = fs.statSync(path);
	if(stat.isDirectory()) return 'directory';
	if(stat.isFile()) return 'file';
}
ext.TrimPath = function(path) {
	return path.slice(0, path.lastIndexOf('/'));
}
ext.ReadJSON = function(path) {
	if(!fs.existsSync(path)) return {};
	var jsonobject = fs.readFileSync(path, {encoding:'utf-8'});
	return JSON.parse(jsonobject);
}
ext.WriteJSON = function(path, json) {
	var filestring = JSON.stringify(json);
	fs.writeFileSync(path, filestring, {encoding:'utf-8'});
}
ext.SetExitCommand = function(command) {
	var exitCommandPath = config.exitPath;
	var string = '#! /usr/bin/bash\n';
	string += command;
	fs.writeFileSync(exitCommandPath, string, {encoding:'utf-8'});
}
ext.CaseInsensitiveSort = function(array) {
	var returnArray = [];
	var H = 0;
	var L = 0;
	for(var i=0; i<array.length; i++){
		returnArray[i] = array[i].toLowerCase() + array[i];
	}
	returnArray.sort();
	for(var i=0, H = 0, W = 0; i<returnArray.length; i++){
		H = returnArray[i].length / 2;
		L = returnArray[i].length;
		returnArray[i] = returnArray[i].slice(H, L);
	}
	return returnArray;
}
ext.NotText = function(string) {
	/*
	if(string.search('[^\x00-\x7F]') === -1) {
		return true;
	}
	*/
	if(string.search('[^\x80-\xFF]')){
		return true;
	}
}
ext.FileSize = function(path) {
	var stat = fs.statSync(path);
	return stat.size;
}
ext.IsText = function(string) {
	if(string.search('[^\x00-\x7F]')) {
		return true;
	}
}
