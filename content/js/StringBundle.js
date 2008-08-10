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