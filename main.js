//var fs = require('fs');
var fs = require('fs');
var sk = require('SimpleKeys');
var ext = require('./lib/ext.js');
var config = require('./config.json');
config.listHeight = config.displayHeight - 3;

// State globals
var gListSelection = 0;
var gListRelativeSelection = 0;
var gListScrollTop = 0;
var gDirectoryList = 0;
var gCurrentPath = '';
var gDisplayValid = true;
var gCurrentItem = '';
var gStartPath = process.cwd();
var gPreviewFooterText = '';
var gSelectorPositions = {};

// Detect Early Command Execution
if(process.argv[2] == 'shoot' || process.argv[2] == 's'){
	Shoot(process.argv[3]);
}
if(process.argv[2] == 'markcurrent' || process.argv[2] == 'mc'){
	MarkCurrent(process.argv[3]);
}
if(process.argv[2] == 'list'){
	ListMarks();
}
// Initialize
InitKeys();
SetDirectoryList(process.cwd());
InitDisplay();


// Display Functions
function InitDisplay() {
	RenderDisplay();
	setInterval(DisplayLoop, 1000 / 30);
}
function DisplayLoop() {
	if(gDisplayValid) return;
	RenderDisplay();
}
// The Preview Functions
function RenderPreview(){
	PreviewHeader();
	PreviewBody();
	PreviewFooter();
	BackToTop();
}
function PreviewHeader(){
	sk.sim('right', config.previewWidth);
	sk.fg('red');
	console.log('the preview header');
}
function PreviewFooter(){
	sk.sim('right', config.previewWidth);
	sk.fg('red');
	console.log(gPreviewFooterText);
}
function PreviewBody(){
	if(gCurrentItem.type == 'directory'){
		var targetPath = gCurrentItem.path;
		var list = fs.readdirSync(gCurrentItem.path);
		list = ext.CaseInsensitiveSort(list);
		var directories = [];
		var files = [];
		var type;
		for(var i=0; i<list.length; i++){
			type = ext.GetFileType(targetPath + '/' + list[i]);
			if(type == 'directory') directories.push(list[i]);
			if(type == 'file') files.push(list[i]);
		}
		list = directories.concat(files);
		gPreviewFooterText = 'Directory Length: ' + list.length;

		for(var i=0; i<config.displayHeight - 2; i++){
			sk.sim('right', config.previewWidth);
			if(list[i]){
				type = ext.GetFileType(targetPath + '/' +  list[i]);
				var thelength = list[i].length;
				if(thelength > config.previewWidth)
					thelength = config.previewWidth;
				if(type == 'directory'){
					sk.fg(config.directory.fg);
					sk.bg(config.directory.bg);
				}
				if(type == 'file'){
					sk.fg(config.file.fg);
					sk.bg(config.file.bg);
				}
				console.log(list[i].slice(0, thelength));
			}
			else console.log('');
		}
	}
	if(gCurrentItem.type == 'file'){
		if(ext.FileSize(gCurrentItem.path) < 500000){
			var fileBuffer = fs.readFileSync(gCurrentItem.path);
			var isAscii = true;
			for(var i=0; i<fileBuffer.length; i++){
				if(fileBuffer[i] > 127) { 
					isAscii = false;
					break;
				}
			}
			if(!isAscii){
				for(var i=0; i<config.displayHeight - 2; i++){
					console.log('');
				}
				gPreviewFooterText = 'Non-text file, cannot preview.';
			}
			else {
				var fileContent = fs.readFileSync(gCurrentItem.path, {encoding:'utf-8'});
				var lineList = fileContent.split('\n');
				var dopreview = true;
				sk.fg('yellow');
				for(var i=0; i<config.displayHeight - 2; i++){
					sk.sim('right', config.previewWidth);
					if(!lineList[i]) dopreview = false;
					else dopreview = true;

					if(dopreview){
						if(lineList[i].length >= config.previewWidth) {
							sk.fg('magenta');
							console.log(lineList[i].slice(0, config.previewWidth));
						} else { 
							sk.fg('cyan');
							console.log(lineList[i]);
						}
						gPreviewFooterText = 'File Length: ' + lineList.length;
					}
					else console.log('');
				}
			}
		}
		else {
			for(var i=0; i<config.displayHeight - 2; i++){
				console.log('');
			}
			gPreviewFooterText = 'File too large, may not be text.';
		}
	}
}
// The Main Display Functions
function RenderDisplay() {
	ClearDisplay();
	RenderHeader();
	RenderList();
	RenderFooter();
	BackToTop();
	RenderPreview();
	gDisplayValid = true;
}
function ClearDisplay() {
	for(var i=0; i<config.displayHeight; i++){
		sk.sim('clearline');
		sk.sim('newline');
	}
	BackToTop();
}
function BackToTop() {
	sk.sim('up', config.displayHeight);
	sk.out('\r');
}
function RenderHeader() {
	sk.fg('red'); sk.bg('black');
	console.log(gCurrentPath);
}
function RenderFooter() {
	sk.fg('red'); sk.bg('black');
	var item = gDirectoryList[gListSelection];
	if(item){
		gTargetPath = item.path;
		gCurrentItem = item;
		console.log(gCurrentItem.path);
	}
	else console.log('Directory is empty.');
	//console.log(item.type);
}
function RenderList() {
	for(var i=0, item; i<config.displayHeight - 2; i++){
		item = gDirectoryList[i + gListScrollTop];
		if(!item){
			console.log('');
			continue;
		}
		sk.fg(item.fg);
		sk.bg(item.bg);
		if(i + gListScrollTop == gListSelection){
			sk.fg(config.selection.fg);
			sk.bg(config.selection.bg);
		}
		console.log(item.name);
	}
}

// Directory Functions
function SetDirectoryList(path) {
	var files = [];
	var directories = [];
	var array = fs.readdirSync(path);
	array = ext.CaseInsensitiveSort(array);
	for(var i=0; i<array.length; i++){
		var item = {};
		item.name = array[i];
		item.path = path + '/' + item.name;
		item.type = ext.GetFileType(item.path);
		if(item.type == 'directory'){
			item.fg = config.directory.fg;
			item.bg = config.directory.bg;
			directories.push(item);
		} else {
			item.fg = config.file.fg;
			item.bg = config.file.bg;
			files.push(item);
		}
	}
	gDirectoryList = directories.concat(files);

	if(gCurrentPath){
		gSelectorPositions[gCurrentPath] = [];
		gSelectorPositions[gCurrentPath].listSelection = gListSelection;
		gSelectorPositions[gCurrentPath].scrollTop = gListScrollTop;
		gSelectorPositions[gCurrentPath].relativeSelection = gListRelativeSelection;
	}
	if(gSelectorPositions[path]){
		gListSelection = gSelectorPositions[path].listSelection;
		gListScrollTop = gSelectorPositions[path].scrollTop;
		gListRelativeSelection = gSelectorPositions[path].relativeSelection;
	} else {
		gListSelection = 0;
		gListScrollTop = 0;
		gListRelativeSelection = 0;
	}
	gCurrentPath = path;
}

// Key Functions
function InitKeys(){
	sk.sim('hidecursor');
	sk.capture();
	// nav
	/*
	sk.on('d', SelectionDown);
	sk.on('e', SelectionUp);
	sk.on('s', DirectoryUp);
	sk.on('f', DirectoryOpen);
	// action
	sk.on('k', DupeTarget);
	sk.on('l', LinkTarget);
	sk.on('j', ChangeDirectoryCurrent);
	sk.on('q', ExitBow);
	sk.on('c', ChangeDirectoryCurrent);
	*/
	sk.on(['j','down'], SelectionDown);
	sk.on(['k','up'], SelectionUp);
	sk.on(['o','l'], DirectoryOpen);
	sk.on(['u','h'], DirectoryUp);
	//sk.on('c', ChangeDirectoryCurrent);
	sk.on('q', ExitBow);
	sk.on('d', DupeTarget);
	sk.on('L', LinkTarget);
	sk.on('enter', Bolt);
	sk.on('c', function(){
		Bolt(gCurrentPath);
	});

	sk.on('J', function(){
		for(var i=0; i<config.listHeight; i++)
			SelectionDown();
	});
	sk.on('K', function(){
		for(var i=0; i<config.listHeight; i++)
			SelectionUp();
	});
}
/*****************************************************************/
// Use command line arguments
/*****************************************************************/
function Bolt(pPath) {
	var arg = process.argv;
	var lPath = gCurrentItem.path;
	if(pPath) lPath = pPath;

	if(!arg[2]){
		Change(lPath);
	}
	if(arg[2] == 'link' || arg[2] == 'l'){
		Link(lPath, arg[3]);
	}
	if(arg[2] == 'copy' || arg[2] == 'c'){
		Copy(lPath, arg[3]);
	}
	if(arg[2] == 'mark' || arg[2] == 'm'){
		Mark(lPath, arg[3]);
	}
	if(arg[2] == 'delete' || arg[2] == 'd'){
		Delete(lPath);
	}
}
function ListMarks() {
	var marks = ext.ReadJSON(config.marksPath);
	sk.fg('blue');
	console.log(marks);
	ExitBow();
}
function Shoot(name) {
	var marks = ext.ReadJSON(config.marksPath);
	var path = marks[name];
	var type = ext.GetFileType(path);
	if(type == 'directory'){
		console.log('Changed directory to ' + marks[name]);
		Change(marks[name]);
	}
}
function Mark(path, name) {
	var marks = ext.ReadJSON(config.marksPath);

	marks[name] = path;
	ext.WriteJSON(config.marksPath, marks);
	ext.SetExitCommand('');
	ExitBow('Marked "' + path + '" as "' + name + '"');
}
function Change(path){
	var command = 'cd ' + path;
	ext.SetExitCommand(command);
	ExitBow();
}
function Link(path, name) {
	var command = 'ln -s ' + gCurrentItem.path + ' ' + process.cwd() + '/';
	if(name) command += name;
	else command += gCurrentItem.name;
	ext.SetExitCommand(command);
	var outputstring = 'Linked "' + gCurrentItem.name + '" ';
	if(name) outputstring += 'as "' + name + '"';

	ExitBow(outputstring);
}
function Copy(path, name) {
	var command = 'cp -r ' + gCurrentItem.path + ' ' + process.cwd() + '/';
	if(name) command += name;
	else command += gCurrentItem.name;
	ext.SetExitCommand(command);
	var outputstring = 'Copied "' + gCurrentItem.name + '" ';
	if(name) outputstring += 'as "' + name + '"';

	ExitBow(outputstring);
}

function Delete(path) {
	var command = 'rm -r ' + path;
	ext.SetExitCommand(command);
	ExitBow('Deleted "' + path + '"');
}
/*****************************************************************/

function DupeTarget() {
	var src = gTargetPath;
	var dest = process.cwd() + '/' + gCurrentItem.name;
	fs.copySync(src, dest);
	sk.sim('clearline');
	console.log('Copied "' + gCurrentItem.name + '"' + ' to current directory.');
	ExitBow();
}
function LinkTarget() {
	var src = gTargetPath;
	var dest = process.cwd() + '/' + gCurrentItem.name;
	fs.symlinkSync(src, dest);
	sk.sim('clearline');
	console.log('Linked "' + gCurrentItem.name + '"' + ' to current directory.');
	ExitBow();
}
function SelectionRight() {
	var command = 'cd ' + gCurrentPath + '/' + gCurrentItem.name;
	ext.SetExitCommand(command);
	ExitBow();
}
function ChangeDirectoryCurrent() {
	var command = 'cd ' + gCurrentPath;
	ext.SetExitCommand(command);
	ExitBow();
}
function SelectionDown(){
	if(gListSelection < gDirectoryList.length - 1){
		if(gListRelativeSelection == config.displayHeight - 3){
			gListScrollTop++;
		}
		if(gListRelativeSelection < config.displayHeight - 3){
			gListRelativeSelection++;
		}
		gListSelection++;
	}
	gDisplayValid = false;
}
function SelectionUp(){
	if(gListSelection > 0){
		if(gListRelativeSelection == 0){
			gListScrollTop--;
		}
		if(gListRelativeSelection > 0){
			gListRelativeSelection--;
		}
		gListSelection--;
	}
	gDisplayValid = false;
}
function DirectoryUp(){
	var path = ext.TrimPath(gCurrentPath);
	SetDirectoryList(path);
	gDisplayValid = false;
}
function DirectoryOpen(){
	var path = gDirectoryList[gListSelection].path;
	if(ext.GetFileType(path) == 'directory'){
		SetDirectoryList(path);
		gDisplayValid = false;
	}
}
function ExitBow(string) {
	sk.sim('showcursor');
	sk.sim('clearline');
	sk.fg('blue');
	if(string)console.log(string);
	process.exit();
}
