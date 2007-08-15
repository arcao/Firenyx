////////////////////////////////////////////////////////////////////////////////
//init
var fn = null;
var fn_p = null;
var fn_s = null;

function fn_init() {
	fn_p = new fn_Pref(fn_branchName);
	fn_s = new fn_StringBundle(fn_stringBundle_properties);
	fn = new firenyx();
}
function fn_destroy() {
	fn.destroy();
	fn_p.destroy();
	fn_s.destroy();
	fn = null;
	fn_p = null;
	fn_s = null;
}