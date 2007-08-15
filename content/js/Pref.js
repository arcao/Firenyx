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
fn_Pref.prototype.clear = function(name) {
	try {
		this.branch.clearUserPref(name);
	} catch(e) {}
}
fn_Pref.prototype.destroy = function() {
	this.service = null;
	this.branchName = null;
	this.branch = null;
	this.wrappedJSObject = null;
}







////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//static function
fn_Pref.getBool = function(name, default_value) {
	p = new fn_Pref(null); 
	var val = p.getBool(name, default_value);
	p.destroy();
	return val;
}
fn_Pref.setBool = function(name, value) {
	p = new fn_Pref(null); 
	var val = p.setBool(name, value);
	p.destroy();
	return val;
}
//User Prefs Int
fn_Pref.getInt = function(name, default_value) {
	p = new fn_Pref(null); 
	var val = p.getInt(name, default_value);
	p.destroy();
	return val;
}
fn_Pref.setInt = function(name, value) {
	p = new fn_Pref(null); 
	var val = p.setInt(name, value);
	p.destroy();
	return val;
}
//User Prefs String
fn_Pref.getString = function(name, default_value) {
	p = new fn_Pref(null); 
	var val = p.getString(name, default_value);
	p.destroy();
	return val;
}
fn_Pref.setString = function(name, value) {
	p = new fn_Pref(null); 
	var val = p.setString(name, value);
	p.destroy();
	return val;
}
fn_Pref.clear = function(name) {
	p = new fn_Pref(null); 
	p.clear(name);
	p.destroy();
}