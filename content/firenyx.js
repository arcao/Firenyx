const fn_branchName = 'extensions.firenyx.';
const fn_user_agent = 'Firenyx_1.0_preview';
const fn_options_xul = 'chrome://firenyx/content/options.xul';
const fn_stringBundle_properties = 'chrome://firenyx/locale/firenyx.properties';

const logme_ConsoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);

const url_nyx_client = "https://www.nyx.cz/code/client.php";
const url_nyx_client_post_vars = "loguser={0}&logpass={1}";
const url_nyx_page = "{0}://www.nyx.cz/index.php?{1}";
const url_nyx_login_page = "{0}://www.nyx.cz/index.php?login=1";
const url_nyx_login_post_vars = "loguser={0}&logpass={1}";

function gBI(id) { return document.getElementById(id); }


function firenyx() {
	this.firstlogin=true;
	this.timer = null;
	this.xmlHttp = null;
	this.wrappedJSObject = this;
	return this;
}
firenyx.prototype.init = function() {
}
firenyx.prototype.startRefreshing = function() {
	this.timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
	window.setTimeout(Delegate.create(this, this.refresh, this.timer), 500);

	var callback = { 
		notify: function(timer) { 
			this.parent.refresh(timer); 
		} 
	}; 
 	callback.parent = this; 

	this.timer.initWithCallback(callback, fn_p.getInt('refresh.time', 60) * 1000, Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
}
firenyx.prototype.updateRefreshing = function() {
	if (this.timer) {
		this.timer.cancel();
		window.setTimeout(Delegate.create(this, this.refresh, this.timer), 500);
		
		var callback = { 
			notify: function(timer) { 
				this.parent.refresh(timer); 
			} 
		}; 
	 	callback.parent = this; 
	
		this.timer.initWithCallback(callback, fn_p.getInt('refresh.time', 60) * 1000, Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
	}
}
firenyx.prototype.stopRefreshing = function() {
	if (this.timer) {
		this.timer.cancel();
	}
}
firenyx.prototype.processRefresh = function() {
	//logme(this.xmlHttp);
	//logme(this.xmlHttp.readyState);
	if (this.xmlHttp.readyState == 4) {
		//logme(this.xmlHttp.status);
		if (this.xmlHttp.status == 200) {
			this.processXML();			
		} else {
			//this.displayError();
		}
  }
}

firenyx.prototype.refresh = function(timer) {
	var url = url_nyx_client;
	
	var username = fn_p.getString('username', null);
	var password = fn_p.getString('password', null);
	
	if (!username || !password) {
		gBI('firenyx-label').value = fn_s.get('fn.statusbar.unlogged');
		return;
	}
	
	if (this.firstlogin) {
		gBI('firenyx-label').value = fn_s.get('fn.statusbar.logging');
		this.firstlogin = false;
	}
	
  var params = fn_utils.printf(url_nyx_client_post_vars, username, password);
  
	this.xmlHttp = new XMLHttpRequest();
	this.xmlHttp.open("POST", url, true);
	this.xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	this.xmlHttp.setRequestHeader("User-Agent",fn_user_agent);
  //logme(url);
	//logme(this.processRefresh);
	this.xmlHttp.onreadystatechange = Delegate.create(this, this.processRefresh);
	this.xmlHttp.send(params);
}
firenyx.prototype.processXML = function() {
	text = this.xmlHttp.responseText;
	//TODO: osetrit, zda to nehazi HTML error stranku
	//logme(this.xmlHttp.responseText);
	//alert(this.xmlHttp.responseText);
	
	var parser = new DOMParser();
	var doc = parser.parseFromString(this.xmlHttp.responseText, "text/xml");
	
	var username = doc.getElementsByTagName('user')[0].getElementsByTagName('username')[0].firstChild.nodeValue;
	var unreaded_obj = doc.getElementsByTagName('boards')[0].getElementsByTagName('board');
	
	var unreaded = 0;
	for(var i=0; i < unreaded_obj.length; i++) {
		//logme(unreaded_obj[i].getAttribute('new'));
		unreaded+=parseInt(unreaded_obj[i].getAttribute('new'));
	}
		
	gBI('firenyx-label').value = fn_utils.printf(fn_s.get('fn.statusbar.text'), username, unreaded);
}
firenyx.prototype.openPage = function(page) {
	//page = 'l=gate'
	var username = fn_p.getString('username', null);
	var password = fn_p.getString('webpassword', null);
	
	if (!username || !password) {
		alert(fn_s.get('fn.main.alert.need_webpassword'));
		return;
	}
	
	var login_url = fn_utils.printf(url_nyx_login_page, 'https');
	var login_params = fn_utils.printf(url_nyx_login_post_vars, username, password);

	this.xmllogin = new XMLHttpRequest();
	this.xmllogin.open("POST", login_url, true);
	this.xmllogin.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	var callback = function() {
		//logme(this.xmllogin.readyState);
		if (this.xmllogin.readyState == 4) {
			//logme(this.xmllogin.status);
			if (this.xmllogin.status == 200) {
				var url = fn_utils.printf(url_nyx_page, 'http', page);
				//logme(url);
				//If the open tabs preference is set to true
				if(true) {
					getBrowser().selectedTab = getBrowser().addTab(url);
				} else {
					window.open(url);
				}
				// This must be done to make generated content render
				//var request = new XMLHttpRequest();
				//request.open("get", "about:blank", false);
				//request.send(null);
			}
		}
	}
	this.xmllogin.onreadystatechange = Delegate.create(this, callback);
	this.xmllogin.send(login_params); 
}
firenyx.prototype.showOptions = function() {
	var w = window.openDialog(fn_options_xul, 'fn_options', 'centerscreen, chrome, modal', Delegate.create(this, this.updateRefreshing));
}
firenyx.prototype.destroy = function() {
	this.stopRefreshing();
	this.timer = null;
	this.xmlHttp = null;
	this.xmllogin = null;
}

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
	logme_ConsoleService.logStringMessage('Firenyx: ' + message);
}

////////////////////////////////////////////////////////////////////////////////
//Pref
function fn_Pref(branchName) {
	this.service = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	this.branchName = branchName;
	this.branch = this.service.getBranch(this.branchName);
	this.wrappedJSObject = this;
	return this;
}
//User Prefs Bool
fn_Pref.prototype.getBool = function(name, default_value) {
	if(this.branch.prefHasUserValue(name)) {
		return this.branch.getBoolPref(name);	
	} else {
		return default_value;
	}
}
fn_Pref.prototype.setBool = function(name, value) {
	return this.branch.setBoolPref(name, value);
}
//User Prefs Int
fn_Pref.prototype.getInt = function(name, default_value) {
	if(this.branch.prefHasUserValue(name)) {
		return this.branch.getIntPref(name);	
	} else {
		return default_value;
	}
}
fn_Pref.prototype.setInt = function(name, value) {
	return this.branch.setIntPref(name, value);
}
//User Prefs String
fn_Pref.prototype.getString = function(name, default_value) {
	if(this.branch.prefHasUserValue(name)) {
		return this.branch.getCharPref(name);	
	} else {
		return default_value;
	}
}
fn_Pref.prototype.setString = function(name, value) {
	return this.branch.setCharPref(name, value);
}
fn_Pref.prototype.destroy = function() {
	this.service = null;
	this.branchName = null;
	this.branch = null;
	this.wrappedJSObject = null;
}


function fn_StringBundle(filename) {
	this.service = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
  this.bundle = this.service.createBundle(filename);
  this.wrappedJSObject = this;
  return this;
}
fn_StringBundle.prototype.get = function(name) {
	return this.bundle.GetStringFromName(name);
}
fn_StringBundle.prototype.destroy = function() {
	this.service = null;
	this.bundle = null;
	this.wrappedJSObject = null;
}

////////////////////////////////////////////////////////////////////////////////
var fn = null;
var fn_p = null;
var fn_s = null;

function fn_init() {
	fn = new firenyx();
	fn.init();
	fn_p = new fn_Pref(fn_branchName);
	fn_s = new fn_StringBundle(fn_stringBundle_properties);
}
function fn_destroy() {
	fn.destroy();
	fn_p.destroy();
	fn_s.destroy();
	fn = null;
	fn_p = null;
	fn_s = null;
}
