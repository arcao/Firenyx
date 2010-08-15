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
fn_utils.formatAgoTime = function(seconds) {
	var minutes = Math.round(seconds / 60);
	var hours = Math.round(seconds / (60 * 60));
	var days = Math.round(seconds / (60 * 60 * 24));
	
	var text = "";
	var value = 0;
	
	if (seconds < 60) {
		text = fn_s.get('fn.activity.seconds_ago');
		value = seconds;
	} else if (minutes < 60) {
		text = fn_s.get('fn.activity.minutes_ago');
		value = minutes;
	} else if (hours < 24) {
		text = fn_s.get('fn.activity.hours_ago');
		value = hours;
	} else { 
		text = fn_s.get('fn.activity.days_ago');
		value = days;
	}
	
	var arrText = text.split('|');
	return this.printf(arrText[(value > 1)? 1 : 0], value);
} 
fn_utils.closeUnpairedTags = function(text) {
	return text.replace(/<((br|img|hr).*?)(\/>|\/\s+>|>)/ig, "<$1 />");
}
fn_utils.getVersion = function() {
	return fn_utils.version;
}
fn_utils.isDefined = function(variable) {
	try {
		return eval('(typeof('+variable+') != "undefined");');
	} catch (e) {
		return false;
	}
}
fn_utils.version = '';
// get app version (ugly code for a quite bad implementation in FF4)
if (Components.classes["@mozilla.org/extensions/manager;1"] != null) {
  fn_utils.version = (function() {
    try {
  		var em = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
  		var addon = em.getItemForID("{5591137f-ca2c-4c2a-93d1-5514992b2d4a}");
  		if (!addon) 
        return '';
  		return addon.version;
  	} catch(e) {
  	  logme(Json.toJSON(e));
  		return '';
  	}
  })();
} else {
  try {  
    Components.utils.import("resource://gre/modules/AddonManager.jsm");  
    AddonManager.getAddonByID("{5591137f-ca2c-4c2a-93d1-5514992b2d4a}", function(addon) {
      //logme(Json.toJSON(addon));
      if (addon != null)
        fn_utils.version = addon.version;              
    });  
  } catch (e) {
    logme(Json.toJSON(e));
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
	if (fn_debug != undefined && fn_debug) {
		const logme_ConsoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
		logme_ConsoleService.logStringMessage('Firenyx: ' + message);
	}
}

function gBI(id) { try { return document.getElementById(id); } catch (e) {return null;} }


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Seamokey compatibility

/* whereToOpenLink() looks at an event to decide where to open a link.
 *
 * The event may be a mouse event (click, double-click, middle-click) or keypress event (enter).
 *
 * On Windows, the modifiers are:
 * Ctrl        new tab, selected
 * Shift       new window
 * Ctrl+Shift  new tab, in background
 * Alt         save
 *
 * You can swap Ctrl and Ctrl+shift by toggling the hidden pref
 * browser.tabs.loadBookmarksInBackground (not browser.tabs.loadInBackground, which
 * is for content area links).
 *
 * Middle-clicking is the same as Ctrl+clicking (it opens a new tab) and it is
 * subject to the shift modifier and pref in the same way.
 *
 * Exceptions: 
 * - Alt is ignored for menu items selected using the keyboard so you don't accidentally save stuff.  
 *    (Currently, the Alt isn't sent here at all for menu items, but that will change in bug 126189.)
 * - Alt is hard to use in context menus, because pressing Alt closes the menu.
 * - Alt can't be used on the bookmarks toolbar because Alt is used for "treat this as something draggable".
 * - The button is ignored for the middle-click-paste-URL feature, since it's always a middle-click.
 */
if (!fn_utils.isDefined('whereToOpenLink')) {
	function whereToOpenLink( e, ignoreButton, ignoreAlt )
	{
		if (!e)
			e = { shiftKey:false, ctrlKey:false, metaKey:false, altKey:false, button:0 };
	
		var shift = e.shiftKey;
		var ctrl =	e.ctrlKey;
		var meta =	e.metaKey;
		var alt	=	e.altKey && !ignoreAlt;
	
		// ignoreButton allows "middle-click paste" to use function without always opening in a new window.
		var middle = !ignoreButton && e.button == 1;
		var middleUsesTabs = fn_Pref.getBool("browser.tabs.opentabfor.middleclick", true);
	
		// Don't do anything special with right-mouse clicks.  They're probably clicks on context menu items.
	
		//@line 143 "/cygdrive/c/builds/tinderbox/Fx-Mozilla1.8-release/WINNT_5.2_Depend/mozilla/browser/base/content/utilityOverlay.js"
		if (ctrl || (middle && middleUsesTabs)) {
		//@line 145 "/cygdrive/c/builds/tinderbox/Fx-Mozilla1.8-release/WINNT_5.2_Depend/mozilla/browser/base/content/utilityOverlay.js"
			if (shift)
				return "tabshifted";
			else
				return "tab";
		}
		else if (alt) {
			return "save";
		}
		else if (shift || (middle && !middleUsesTabs)) {
			return "window";
		}
		else {
			return "current";
		}
	}
}

// Used as an onclick handler for UI elements with link-like behavior.
// e.g. onclick="checkForMiddleClick(this, event);"
if (!fn_utils.isDefined('checkForMiddleClick')) {
	function checkForMiddleClick(node, event)
	{
		// We should be using the disabled property here instead of the attribute,
		// but some elements that this function is used with don't support it (e.g.
		// menuitem).
		if (node.getAttribute("disabled") == "true")
			return; // Do nothing
	
		if (event.button == 1) {
			/* Execute the node's oncommand.
			 *
			 * XXX: we should use node.oncommand(event) once bug 246720 is fixed.
			 */
			var fn = new Function("event", node.getAttribute("oncommand"));
			fn.call(node, event);
	
			// If the middle-click was on part of a menu, close the menu.
			// (Menus close automatically with left-click but not with middle-click.)
			closeMenus(event.target);
		}
	}
}
// Closes all popups that are ancestors of the node.
if (!fn_utils.isDefined('closeMenus')) {
	function closeMenus(node)
	{
		if ("tagName" in node) {
			if (node.namespaceURI == "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
			&& (node.tagName == "menupopup" || node.tagName == "popup"))
				node.hidePopup();
	
			closeMenus(node.parentNode);
		}
	}
}
