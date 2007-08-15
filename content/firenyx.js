const fn_branchName = 'extensions.firenyx.';
const fn_user_agent = 'Firenyx_1.0_preview';
const fn_options_xul = 'chrome://firenyx/content/options.xul';
const fn_writemail_xul = 'chrome://firenyx/content/writemail.xul';
const fn_stringBundle_properties = 'chrome://firenyx/locale/firenyx.properties';

const logme_ConsoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);

const url_nyx_client = "https://www.nyx.cz/code/client.php";
const url_nyx_avatars = "http://i.nyx.cz/{0}/{1}.gif";

const url_nyx_client_post_vars = "loguser={0}&logpass={1}";
const url_nyx_client_writemail_post_vars = "loguser={0}&logpass={1}&recipient={2}&message={3}";

const url_nyx_page = "{0}://www.nyx.cz/index.php?{1}";
const url_nyx_login_page = "{0}://www.nyx.cz/index.php?login=1";

const url_nyx_login_post_vars = "loguser={0}&logpass={1}";

const fn_img_throbber = 'chrome://firenyx/skin/throbber.gif';
const fn_img_butterfly = 'chrome://firenyx/skin/butterfly.png';

const fn_img_alert_mail = 'chrome://firenyx/skin/alert/new/mail.png';
const fn_img_alert_friend = 'chrome://firenyx/skin/alert/new/friend.png';
const fn_img_alert_topic = 'chrome://firenyx/skin/alert/new/topic.png';

const fn_img_alert_info = 'chrome://firenyx/skin/alert/new/info.png';
const fn_img_alert_stop = 'chrome://firenyx/skin/alert/new/stop.png';
const fn_img_alert_ok = 'chrome://firenyx/skin/alert/new/ok.png';
const fn_img_alert_network = 'chrome://firenyx/skin/alert/new/network.png';
const fn_img_alert_key = 'chrome://firenyx/skin/alert/new/key.png';

const fn_img_avatar_error = 'chrome://firenyx/skin/no_avatar.gif';

const ALERT_CHROME_URL = 'chrome://firenyx/content/alerts/alert.xul';

function gBI(id) { return document.getElementById(id); }


function firenyx() {
	this.firstlogin=true;
	this.timer = null;
	this.xmlHttp = null;
	this.wrappedJSObject = this;
	this.topic = new Object();
	this.topic.items = [];
	this.topic.cats = [];
	this.topic.unreaded = 0;
	this.friends = [];
	this.generated = 0;
	this.dont_show_network_error = false;
	this.sidebar = new firenyx_sidebar();
	this.init();
	return this;
}
firenyx.prototype.init = function() {
	this.observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  this.observerService.addObserver(this, "firenyx:mail:new", false);
  
	this.observerService.addObserver(this, "firenyx:topic:add", false);
  this.observerService.addObserver(this, "firenyx:topic:update", false);
  this.observerService.addObserver(this, "firenyx:topic:newposts", false);
  this.observerService.addObserver(this, "firenyx:topic:remove", false);
  
	this.observerService.addObserver(this, "firenyx:friend:add", false);
  this.observerService.addObserver(this, "firenyx:friend:update", false);
  this.observerService.addObserver(this, "firenyx:friend:remove", false);
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
	try {
		//logme(this.xmlHttp);
		//logme(this.xmlHttp.readyState);
		if (this.xmlHttp.readyState == 4) {
			//logme(this.xmlHttp.status);
			if (this.xmlHttp.status == 200) {
				this.processXML();			
			} else {
				throw new Error(this.xmlHttp.status);
			}
	  }
	} catch (e) {
		gBI('firenyx-label').value = fn_s.get('fn.statusbar.unlogged');
		if (!this.dont_show_network_error) {
			this.dont_show_network_error = true;
			this.showAlert(fn_img_alert_network, fn_s.get('fn.error.network.title'), fn_s.get('fn.error.network.text'), false, '');
		}
		logme('ERR> '+e.name+': '+e.message);
		throw e;
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
	
	if (this.firstlogin || this.dont_show_network_error) {
		gBI('firenyx-label').value = fn_s.get('fn.statusbar.logging');
	}
	
  var params = fn_utils.printf(url_nyx_client_post_vars, encodeURIComponent(username), encodeURIComponent(password));
  
  gBI('firenyx-icon').src = fn_img_throbber;
  
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
	//text = this.xmlHttp.responseText;
	//TODO: osetrit, zda to nehazi HTML error stranku
	//zpracovani chyb 1.cast
	logme(this.xmlHttp.responseText);
	gBI('firenyx-icon').src = fn_img_butterfly;
	
	if (this.xmlHttp.responseText.indexOf('<?xml') != 0) {
		this.dont_show_network_error = true;
		this.showAlert(fn_img_alert_key, fn_s.get('fn.error.login.title'), fn_s.get('fn.error.login.text'), false, '');
		gBI('firenyx-label').value = fn_s.get('fn.statusbar.unlogged');
		return;
	}
	//alert(this.xmlHttp.responseText);
	
	var parser = new DOMParser();
	var doc = parser.parseFromString(this.xmlHttp.responseText, "text/xml");
	
	//zpracovani chyb 2.cast
	var error_obj = doc.getElementsByTagName('page')[0].getElementsByTagName('error');
	if (error_obj.length > 0) {
		this.showAlert(fn_img_alert_stop, fn_s.get('fn.error.nyx.title'), fn_utils.printf(fn_s.get('fn.error.login.title'), error_obj[0].firstChild.nodeValue), false, '');
	}
	
	//pokud obsahuje xml jen chybove hlaseni tak nepokracovat dal  
	if (doc.getElementsByTagName('info')[0].getElementsByTagName('friends').length <1) {
		gBI('firenyx-label').value = fn_s.get('fn.statusbar.unlogged');
		this.dont_show_network_error = true;
		return;
	}
	
	this.dont_show_network_error = false;
	
	this.username = doc.getElementsByTagName('user')[0].getElementsByTagName('username')[0].firstChild.nodeValue;
	try {
		this.generated = parseInt(doc.getElementsByTagName('page')[0].getElementsByTagName('generated')[0].firstChild.nodeValue, 10);
		//pri prvnim prihlaseni se posila otaznik, feature?
		if (isNaN(this.generated)) throw new Error();
	} catch(e) {
		this.generated = (new Date()).getTime() /1000;
	}
	
	//----------------------------------------------------------------------------
	//zpracovani posty
	var mail_obj = doc.getElementsByTagName('info')[0].getElementsByTagName('mail');
	if (mail_obj.length > 0) {
		var message_obj = mail_obj[0].getElementsByTagName('message');
		var items = [];
		for(var i=0; i < message_obj.length; i++) {
			var from = message_obj[i].getElementsByTagName('username')[0].firstChild.nodeValue;
			var message = message_obj[i].getElementsByTagName('text')[0].firstChild.nodeValue;
			var time = parseInt(message_obj[i].getElementsByTagName('time')[0].firstChild.nodeValue, 10);
			items.push({'from': from, 'time': time, 'message': message});
		}
		this.observerService.notifyObservers(null, "firenyx:mail:new", json.toJSON(items));
		
		//pozdeji prehodit do observe fce
		if (items.length > 1) {
			var messages = '';
			for(var i=0; i < items.length; i++) {
				if (i!=0) messages+="<br/><br/>";
				messages+='<strong>'+items[i].from+":</strong><br/>";
				messages+=items[i].message;
			}
			this.showAlert(fn_img_alert_mail, fn_s.get('fn.alert.newmail_multiple.title'), messages, true, 'nyxhref:l=mail', 'html');
		} else {
			this.showAlert(fn_img_alert_mail, fn_utils.printf(fn_s.get('fn.alert.newmail.title'), items[0].from), items[0].message, true, 'nyxhref:l=mail', 'html');
		}
	}
	
	//----------------------------------------------------------------------------
	//zpracovani klubu
	var books_obj = doc.getElementsByTagName('boards')[0].getElementsByTagName('board');
	this.topic.unreaded = 0;
	var books = [];
	for(var i=0; i < books_obj.length; i++) {
		//logme(unreaded_obj[i].getAttribute('new'));
		var book_name = books_obj[i].firstChild.nodeValue;
		var book_id = parseInt(books_obj[i].getAttribute('id'), 10);
		var book_unreaded = parseInt(books_obj[i].getAttribute('new'), 10);
		var cat_name = books_obj[i].parentNode.getAttribute('name');
		//TODO: presvedcit nyxe, aby to tam zakomponoval
		var cat_id = 0;
		
		books.push({'name': book_name, 'id': book_id, 'unreaded': book_unreaded, 'cat_name': cat_name, 'cat_id': cat_id});
		this.topic.unreaded+=book_unreaded;
	}
	//kluby hledani pridanych/odebranych/novych prizpevku v klubech
	for(var i=0; i <this.topic.items.length; i++) {
		var lb = this.topic.items[i];
		var found = false;
		var f = lb;
		for(var y=0; y < books.length;y++) if (lb.id == books[y].id) {found=true; f=books[y]; break;}
		if (found) {
			//topic update
			//nove neprectene?
			if (lb.unreaded < f.unreaded) this.observerService.notifyObservers(null, "firenyx:topic:newposts", json.toJSON(f));
			this.observerService.notifyObservers(null, "firenyx:topic:update", json.toJSON(f));
		} else {
			//topic remove
			this.observerService.notifyObservers(null, "firenyx:topic:remove", json.toJSON(f));
		}
	}
	for(var i=0; i < books.length; i++) {
		var f = books[i];
		var found = false;
		for(var y=0; y < this.topic.items.length;y++) if (f.id == this.topic.items[y].id) {found=true; break;}
		if (!found) {
			//friend add
			this.observerService.notifyObservers(null, "firenyx:topic:add", json.toJSON(f));
		}
	}
	//kategorie
	this.topic.cats = [];
	var cats_obj = doc.getElementsByTagName('boards')[0].getElementsByTagName('category');
	for(var i=0; i < cats_obj.length; i++) {
		var cat_name = cats_obj[i].getAttribute('name');
		var cat_id = 0;
		this.topic.cats.push({'name': cat_name, 'id': cat_id});
	}
	//logme(json.toJSON(books));
	//logme(json.toJSON(this.topic.cats));
	this.topic.items = books;
	
	//----------------------------------------------------------------------------
	//zpracovani friend
	var friend_obj = doc.getElementsByTagName('friends')[0].getElementsByTagName('friend');
	var friends = []
	for(var i=0; i < friend_obj.length; i++) {
		var id = parseInt(friend_obj[i].getElementsByTagName('id')[0].firstChild.nodeValue, 10);
		var username = friend_obj[i].getElementsByTagName('username')[0].firstChild.nodeValue;
		var refresh = parseInt(friend_obj[i].getElementsByTagName('refresh')[0].firstChild.nodeValue, 10);
		friends.push({'id': id, 'username': username, 'refresh': refresh});
	}
	for(var i=0; i < this.friends.length; i++) {
		var lf = this.friends[i];
		var found = false;
		var f = lf;
		for(var y=0; y < friends.length;y++) if (lf.username == friends[y].username) {found=true; f=friends[y]; break;}
		if (found) {
			//friend update
			this.sidebar.editPeople(f.username, this.generated-f.refresh);
			this.observerService.notifyObservers(null, "firenyx:friend:update", json.toJSON(f));
		} else {
			//friend remove
			this.sidebar.removePeople(f.username);
			this.observerService.notifyObservers(null, "firenyx:friend:remove", json.toJSON(f));
		}
	}
	for(var i=0; i < friends.length; i++) {
		var f = friends[i];
		var found = false;
		for(var y=0; y < this.friends.length;y++) if (f.username == this.friends[y].username) {found=true; break;}
		if (!found) {
			//friend add
			this.sidebar.addPeople(f.username, f.id, this.generated-f.refresh);
			this.observerService.notifyObservers(null, "firenyx:friend:add", json.toJSON(f));
		}
	}
	
	this.friends = friends; 
	
	this.firstlogin = false;
	gBI('firenyx-label').value = fn_utils.printf(fn_s.get('fn.statusbar.text'), this.username, this.topic.unreaded);
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
	var login_params = fn_utils.printf(url_nyx_login_post_vars, encodeURIComponent(username), encodeURIComponent(password));

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
firenyx.prototype.sendMail = function(message_to, message, nohtml) {
	var username = fn_p.getString('username', null);
	var password = fn_p.getString('webpassword', null);
	
	if (!username || !password) {
		//TODO:pridat nejakou zpravu ze neni mozne odesilat postu bez zadani hesla
		return;
	}
	
	if (nohtml!=undefined && nohtml) {
		message = fn_utils.encodehtml(message);
	}
	
	//xmlHTTP nechodi po zavreni okna - reseni volat to v novem vlakne (timer)
	var callback = function() {
		var url = url_nyx_client;
		//alert(message_to+":\n"+message);
		var params = fn_utils.printf(url_nyx_client_writemail_post_vars, encodeURIComponent(username), encodeURIComponent(password), encodeURIComponent(message_to), encodeURIComponent(message));
	
		this.xmlHttp = new XMLHttpRequest();
		this.xmlHttp.open("POST", url, true);
		this.xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		this.xmlHttp.onreadystatechange = Delegate.create(this, this.processRefresh);
		this.xmlHttp.send(params);
		gBI('firenyx-icon').src = fn_img_throbber;
	}
	window.setTimeout(Delegate.create(this, callback), 10);
}
firenyx.prototype.showWriteMail = function(to) {
	if (to==undefined) to='';
	window.openDialog(fn_writemail_xul, 'fn_options', 'centerscreen, chrome', this, to);
}
firenyx.prototype.showOptions = function() {
	window.openDialog(fn_options_xul, 'fn_options', 'centerscreen, chrome, modal', this);
}
//icon=icon uri, title=title, txt=text, clickable=zavola this.observe po kliknuti, data=hodnota predana pod data v this.observe  
firenyx.prototype.showAlert = function(icon, title, text, clickable, data, type) {
	//var alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
	//alertsService.showAlertNotification(icon, title, text, clickable, data, this);
	//owner draw alert box
	if (type==undefined) type='plain';
	if (type=='plain') text = fn_utils.encodehtml(text);
	//var args = [icon, title, text, clickable, data, this];
	window.openDialog(ALERT_CHROME_URL, "_blank", 'chrome,dialog=yes,titlebar=no,popup=yes', icon, title, text, clickable, data, this);
}
firenyx.prototype.onAlertFinished = function() {},
firenyx.prototype.onAlertClickCallback = function(aCookie) {
	if (aCookie.indexOf(':')!=0) {
		var action = aCookie.split(':')[0];
		var param = aCookie.split(':')[1];
		
		switch(action.toLowerCase()) {
			case 'nyxhref':
				this.openPage(param);
				break;
		}
	}
}
firenyx.prototype.observe = function(subject, topic, data) {
	logme('observer> subject:'+subject+' topic:'+topic+' data:'+data);
	
	if (topic=='alertclickcallback') this.onAlertClickCallback(data);
	if (topic=='alertfinished') this.onAlertFinished();
}
//------------------------------------------------------------------------
//sidebar
firenyx.prototype.toggleSidebar = function() {
	var hidden = !gBI('firenyx-dashboard').hidden;
	gBI('firenyx-dashboard').hidden = hidden;
	gBI('firenyx-dashboard-splitter').hidden = hidden;
	
	//TODO: provest zaskrtnuti v menu
}
function firenyx_sidebar() {
	return this; 
}
firenyx_sidebar.prototype.addPeople = function(nick, id, time) {
	nick = nick.toUpperCase();

	var list = gBI('firenyx-friends');
	
	var items = list.getElementsByTagName('richlistitem');
	
	var beforeEl = null;
	
	for(var i=0; i<items.length; i++) {
		if(items[i].nick>nick) { beforeEl = items[i]; break; }
	}
	
	var el = document.createElement('richlistitem');
	
	el.nick = nick;
	el.id = id;
	
	var hbox = document.createElement('hbox');
	
	var image = document.createElement('image');
	image.setAttribute('src', fn_utils.printf(url_nyx_avatars, nick.substring(0,1), nick));
	image.onerror = function() { image.src=fn_img_avatar_error;};
	
	var vbox = document.createElement('vbox');
	
	var label_nick = document.createElement('label');
	label_nick.setAttribute('value', nick);
	var label_time = document.createElement('label');
	label_time.setAttribute('value', fn_utils.formatTime(time));
	
	vbox.appendChild(label_nick);
	vbox.appendChild(label_time);
	
	hbox.appendChild(image);
	hbox.appendChild(vbox);
	
	el.appendChild(hbox);
	
	if (!beforeEl) { 
		list.appendChild(el);
	} else {
		list.insertBefore(el, beforeEl);
	}
	return el;
}
firenyx_sidebar.prototype.editPeople = function(nick, time) {
	nick = nick.toUpperCase();
	
	var list = gBI('firenyx-friends');
	var items = list.getElementsByTagName('richlistitem');
	var el = null;
	for(var i=0; i<items.length; i++) {
		logme(items[i].nick);
		if(items[i].nick==nick) { el = items[i]; break; }
	}
	
	if (el) {
		el.getElementsByTagName('label')[1].value = fn_utils.formatTime(time);
		logme(el.getElementsByTagName('label')[1].value);
	}	
}
firenyx_sidebar.prototype.removePeople = function(nick) {
	nick = nick.toUpperCase();
	
	var list = gBI('firenyx-friends');
	var items = list.getElementsByTagName('richlistitem');
	var el = null;
	for(var i=0; i<items.length; i++) if(items[i].nick==nick) { el = items[i]; break; }
	
	if (el) list.removeChild(el);
}
firenyx_sidebar.prototype.menuAction = function(action) {
	var item = gBI('firenyx-friends').selectedItem;
	switch(action.toLowerCase()) {
		case 'newmail':
			fn.showWriteMail(item.nick);
			break;
		case 'userinfo':
			fn.openPage('l=user;id='+item.nick);
			break;
	}
}
firenyx.prototype.destroy = function() {
	//observers
	this.observerService.removeObserver(this, "firenyx:mail:new", false);
	
	this.observerService.removeObserver(this, "firenyx:topic:add", false);
	this.observerService.removeObserver(this, "firenyx:topic:update", false);
	this.observerService.removeObserver(this, "firenyx:topic:newposts", false);
	this.observerService.removeObserver(this, "firenyx:topic:remove", false);
	
	this.observerService.removeObserver(this, "firenyx:friend:add", false);
	this.observerService.removeObserver(this, "firenyx:friend:update", false);
	this.observerService.removeObserver(this, "firenyx:friend:remove", false);
	
	this.observerService = null;
	
	//timer
	this.stopRefreshing();
	//other
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
	//logme_ConsoleService.logStringMessage('Firenyx: ' + message);
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
// JSON, by Mark Gibson, hacked the original json.js into a jQuery plugin.
// original: http://jollytoad.googlepages.com/json.js
// Edited into object version by Arcao
function json() {
	var m = {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\' };
	var s = {
    'array': function (x) {
        var a = ['['], b, f, i, l = x.length, v;
        for (i = 0; i < l; i += 1) {
            v = x[i];
            f = s[typeof v];
            if (f) {
                v = f(v);
                if (typeof v == 'string') {
                    if (b) {
                        a[a.length] = ',';
                    }
                    a[a.length] = v;
                    b = true;
                }
            }
        }
        a[a.length] = ']';
        return a.join('');
    },
    'boolean': function (x) {
        return String(x);
    },
    'null': function (x) {
        return "null";
    },
    'number': function (x) {
        return isFinite(x) ? String(x) : 'null';
    },
    'object': function (x) {
        if (x) {
            if (x instanceof Array) {
                return s.array(x);
            }
            var a = ['{'], b, f, i, v;
            for (i in x) {
                v = x[i];
                f = s[typeof v];
                if (f) {
                    v = f(v);
                    if (typeof v == 'string') {
                        if (b) {
                            a[a.length] = ',';
                        }
                        a.push(s.string(i), ':', v);
                        b = true;
                    }
                }
            }
            a[a.length] = '}';
            return a.join('');
        }
        return 'null';
    },
    'string': function (x) {
        if (/["\\\x00-\x1f]/.test(x)) {
            x = x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                var c = m[b];
                if (c) {
                    return c;
                }
                c = b.charCodeAt();
                return '\\u00' +
                    Math.floor(c / 16).toString(16) +
                    (c % 16).toString(16);
            });
        }
        return '"' + x + '"';
    }
  };
  this.s = s;
}
json.prototype.toJSON = function(v) {
	var f = isNaN(v) ? this.s[typeof v] : this.s['number'];
	if (f) return f(v);
	return '';
}
json.prototype.parseJSON = function(v, safe) {
	if (safe === undefined) safe = false;
	if (safe && !/^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/.test(v))
		return undefined;
	return eval('('+v+')');
}
json = new json();
////////////////////////////////////////////////////////////////////////////////
var fn = null;
var fn_p = null;
var fn_s = null;

function fn_init() {
	fn = new firenyx();
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
