////////////////////////////////////////////////////////////////////////////////
//init
var fn = null;
var fn_p = null;
var fn_s = null;
var fn_debug = true;

function fn_init() {
	fn_p = new fn_Pref(fn_branchName);
	fn_s = new fn_StringBundle(fn_stringBundle_properties);
	fn = new firenyx();
	//fn_debug = fn_p.getBool('debug_mode', false);
}
function fn_destroy() {
	fn.destroy();
	fn_p.destroy();
	fn_s.destroy();
	fn = null;
	fn_p = null;
	fn_s = null;
}
function fn_remove_node(node) {
	node.parentNode.removeChild(node);
}
function fn_remove() {
	var r = fn_remove_node;
	r(gBI('firenyx-tools-menu-item'));
	r(gBI('firenyx-statuspanel'));
	r(gBI('firenyx-popupmenu-statusbar'));
	r(gBI('keyFirenyxSidebarShortcut'));
	r(gBI('firenyx-toggleSidebar-2'));
	r(gBI('firenyx-dashboard'));
	r(gBI('firenyx-dashboard-splitter'));
}