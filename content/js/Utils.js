////////////////////////////////////////////////////////////////////////////////
//utils
function fn_utils() {}
fn_utils.printf = function() { 
  var num = arguments.length; 
  var oStr = arguments[0];   
  for (var i = 1; i < num; i++) { 
    var pattern = "\\{" + (i-1) + "\\}"; 
    var re = new RegExp(pattern, "g"); 
    oStr = oStr.replace(re, arguments[i]); 
  } 
  return oStr; 
}
fn_utils.encodehtml = function(text) {
	text = text.replace(/&/g,"&amp;");
	text = text.replace(/</g,"&lt;");
	text = text.replace(/>/g,"&gt;");
	text = text.replace(/\r\n/g,"<br/>");
	text = text.replace(/\n/g,"<br/>");
	text = text.replace(/\r/g,"<br/>");
	return text;
}
fn_utils.formatTime = function(sec) {
	var minutes = Math.floor(sec / 60);
	var seconds = Math.floor(sec - minutes*60);
	
	var str = minutes;
	str+= ':';
	str+= (seconds < 10) ? '0'+seconds: seconds;
	return str;
}
fn_utils.closeUnpairedTags = function(text) {
	return text.replace(/<((br|img|hr).*?)(\/>|\/\s+>|>)/ig, "<$1 />");
}
fn_utils.getVersion = function(guid) {
	try {
		var em = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
		var addon = em.getItemForID(guid);
		if (!addon) return '';
		return addon.version;
	} catch(e) {
		return '';
	}
}
////////////////////////////////////////////////////////////////////////////////
//delegate
function Delegate() {}
Delegate.create = function (o, f) {
  var a = new Array() ;
  var l = arguments.length ;
  for(var i = 2 ; i < l ; i++) a[i - 2] = arguments[i] ;
  return function() {
    var aP = [].concat(arguments, a) ;
    f.apply(o, aP);
  }
}

function logme(message) {
	//const logme_ConsoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
	//logme_ConsoleService.logStringMessage('Firenyx: ' + message);
}

function gBI(id) { return document.getElementById(id); }
