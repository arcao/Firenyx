const fn_branchName = 'extensions.firenyx.';
//client user-agent/version: {0} version like 0.1.5.2007082201
const fn_user_agent = 'Firenyx_{0}';
const fn_options_xul = 'chrome://firenyx/content/options.xul';
const fn_about_xul = 'chrome://firenyx/content/about/about.xul';
const fn_writemail_xul = 'chrome://firenyx/content/writemail.xul';
const fn_stringBundle_properties = 'chrome://firenyx/locale/firenyx.properties';

const url_nyx_client = "https://www.nyx.cz/code/client.php";
//ico url, all params must be uppercase: {0}=first letter of nick, {1}=nick
const url_nyx_avatars = "http://i.nyx.cz/{0}/{1}.gif";

//client login post vars: {0}=username, {1}=password, {2}=other post params
const url_nyx_client_post_vars = "loguser={0}&logpass={1}{2}";
//client send mail post vars: {0}=username, {1}=password, {3}=recipient, {4}=message
const url_nyx_client_writemail_post_vars = "loguser={0}&logpass={1}&recipient={2}&message={3}";

//nyx global page url: {0}=protocol, {1}=params
const url_nyx_page = "{0}://www.nyx.cz/index.php?{1}";
//nyx login url: {0}=protocol
const url_nyx_login_page = "{0}://www.nyx.cz/index.php?login=1";
//nyx login post vars: {0}=username, {1}=password, {2}=invisible(1/0)
const url_nyx_login_post_vars = "loguser={0}&logpass={1}&loginv={2}";

const fn_img_throbber = 'chrome://firenyx/skin/throbber.gif';
const fn_img_butterfly = 'chrome://firenyx/skin/butterfly.png';
const fn_img_butterfly_disabled = 'chrome://firenyx/skin/butterfly_disabled.png';

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
const FIRENYX_CHROME_BASE = 'chrome://firenyx/';

function firenyx() {
	this.firstlogin=true;
	this.timer = null;
	this.xmlHttp = null;
	this.wrappedJSObject = this;
	this.topics = new Object();
	this.topics.items = [];
	this.topics.cats = [];
	this.topics.unreaded = 0;
	this.friends = [];
	this.generated = 0;
	this.dont_show_network_error = false;
	this.sidebar = null;
	this.disabled = false;
	this.old_mail_count = 0;
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
	this.disabled = fn_p.getBool('disabled', false);
	this.sidebar = new firenyx_sidebar();
	this.upgradeSettings();
}
firenyx.prototype.startRefreshing = function() {
	this.timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
	this.setDisabled(this.disabled);
}
firenyx.prototype.updateRefreshing = function() {
	if (this.disabled) return;
	if (this.timer) {
		this.timer.cancel();
		window.setTimeout(Delegate.create(this, this.refresh, this.timer), 1);
		
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
		this.topics = new Object();
		this.topics.items = [];
		this.topics.cats = [];
		this.topics.unreaded = 0;
		this.friends = [];
		this.generated = 0;
	}
}
firenyx.prototype.setDisabled = function(state) {
	this.disabled = state;
	fn_p.setBool('disabled', state);
	
	try{ gBI('firenyx-toggleDisabled-0').setAttribute('checked', state); } catch(e) {};
	try{ gBI('firenyx-toggleDisabled-1').setAttribute('checked', state); } catch(e) {};
	
	for(i=0; i<20;i++) try{ gBI('firenyx-menuDisabled-'+i).setAttribute('disabled', state); } catch(e) {};
	for(i=0; i<3;i++) try{ gBI('firenyx-toggleSidebar-'+i).setAttribute('disabled', state); } catch(e) {};
	
	if (state) {
		gBI('firenyx-statuspanel').setAttribute('class', 'disabled');
		gBI('firenyx-icon').src = fn_img_butterfly_disabled;
		this.sidebar.toggleSidebar(false);
		gBI('firenyx-label').value = fn_s.get('fn.statusbar.unlogged');
		this.stopRefreshing();
	} else {
		gBI('firenyx-statuspanel').setAttribute('class', '');
		this.updateRefreshing();
	}	
}
firenyx.prototype.toggleDisabled = function() {
	this.setDisabled(!this.disabled);
}
firenyx.prototype.processRefresh = function() {
	try {
		//logme(this.xmlHttp);
		//logme(this.xmlHttp.readyState);
		if (this.xmlHttp.readyState == 4) {
			//logme(this.xmlHttp.status);
			if (this.xmlHttp.status == 200) {
				if (!this.xmlHttp.responseText) throw new Error('Empty responseText'); 	
				this.processXML();			
			} else {
				throw new Error(this.xmlHttp.status);
			}
		}
	} catch (e) {
		gBI('firenyx-label').value = fn_s.get('fn.statusbar.unlogged');
		gBI('firenyx-icon').src = fn_img_butterfly;
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
	
	//var password = fn_p.getString('password', null);
	var fn_pm = new fn_PasswordManager(FIRENYX_CHROME_BASE+'password');
	var password = fn_pm.get(username);
	fn_pm = null;
	
	if (!username || !password) {
		gBI('firenyx-label').value = fn_s.get('fn.statusbar.unlogged');
		return;
	}
	
	if (this.firstlogin || this.dont_show_network_error) {
		gBI('firenyx-label').value = fn_s.get('fn.statusbar.logging');
	}
	
	var append_post_vars = '';
	//neoznacovani posty?
	if (fn_p.getBool('donot_mark_mail_as_readed', false)) append_post_vars+= '&ignore_mail=1'; 
	
	var params = fn_utils.printf(url_nyx_client_post_vars, encodeURIComponent(username), encodeURIComponent(password), append_post_vars);
	
	gBI('firenyx-icon').src = fn_img_throbber;
	
	this.xmlHttp = new XMLHttpRequest();
	this.xmlHttp.open("POST", url, true);
	this.xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	this.xmlHttp.setRequestHeader("User-Agent", fn_utils.printf(fn_user_agent, fn_utils.getVersion('{5591137f-ca2c-4c2a-93d1-5514992b2d4a}')));
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
	//logme(this.xmlHttp.responseText);
	
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
	var mail_count = -1;
	//prvni zpusob: oznacovani posty jako prectenou
	if (!fn_p.getBool('donot_mark_mail_as_readed', false)) {
		if (!fn_p.getBool('donot_show_mail_alert', false)) {
			var mail_obj = doc.getElementsByTagName('info')[0].getElementsByTagName('mail');
			if (mail_obj.length > 0) {
				var message_obj = mail_obj[0].getElementsByTagName('message');
				var items = [];
				for(var i=0; i < message_obj.length; i++) {
					var from = message_obj[i].getElementsByTagName('username')[0].firstChild.nodeValue;
					var message = message_obj[i].getElementsByTagName('text')[0].firstChild.nodeValue;
					var time = parseInt(message_obj[i].getElementsByTagName('time')[0].firstChild.nodeValue, 10);
					//Osetreni bugu! Uzavreni nedparovych tagu
					message = fn_utils.closeUnpairedTags(message);
					
					items.push({'from': from, 'time': time, 'message': message});
				}
				this.observerService.notifyObservers(null, "firenyx:mail:new", Json.toJSON(items));
				
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
		}
	} else {
		//druhy zpusob: neoznacovani posty jako prectenou
		var mail_obj = doc.getElementsByTagName('info')[0].getElementsByTagName('mail');
		mail_count = 0;
		if (mail_obj.length > 0) {
			try {
				mail_count = parseInt(mail_obj[0].getAttribute('new'), 10);
			} catch(e) {
				mail_count = 0;
			}
		}
		
		if (this.old_mail_count < mail_count && !fn_p.getBool('donot_show_mail_alert', false)) {
			//nova posta!
			this.observerService.notifyObservers(null, "firenyx:mail:new", Json.toJSON([{'from': '', 'time': -1, 'message': ''}]));
			this.showAlert(fn_img_alert_mail, fn_s.get('fn.alert.newmail2.title'), fn_s.get('fn.alert.newmail2.message'), true, 'nyxhref:l=mail', 'plain');
		}
		this.old_mail_count = mail_count;
	}
	
	//----------------------------------------------------------------------------
	//zpracovani klubu
	var books_obj = doc.getElementsByTagName('boards')[0].getElementsByTagName('board');
	this.topics.unreaded = 0;
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
		this.topics.unreaded+=book_unreaded;
	}
	//kluby hledani pridanych/odebranych/novych prizpevku v klubech
	for(var i=0; i <this.topics.items.length; i++) {
		var lb = this.topics.items[i];
		var found = false;
		var f = lb;
		for(var y=0; y < books.length;y++) if (lb.id == books[y].id) {found=true; f=books[y]; break;}
		if (found) {
			//topic update
			//nove neprectene?
			if (lb.unreaded < f.unreaded) this.observerService.notifyObservers(null, "firenyx:topic:newposts", Json.toJSON(f));
			this.observerService.notifyObservers(null, "firenyx:topic:update", Json.toJSON(f));
		} else {
			//topic remove
			this.observerService.notifyObservers(null, "firenyx:topic:remove", Json.toJSON(f));
		}
	}
	for(var i=0; i < books.length; i++) {
		var f = books[i];
		var found = false;
		for(var y=0; y < this.topics.items.length;y++) if (f.id == this.topics.items[y].id) {found=true; break;}
		if (!found) {
			//friend add
			this.observerService.notifyObservers(null, "firenyx:topic:add", Json.toJSON(f));
		}
	}
	//kategorie
	this.topics.cats = [];
	var cats_obj = doc.getElementsByTagName('boards')[0].getElementsByTagName('category');
	for(var i=0; i < cats_obj.length; i++) {
		var cat_name = cats_obj[i].getAttribute('name');
		var cat_id = 0;
		this.topics.cats.push({'name': cat_name, 'id': cat_id});
	}
	//logme(Json.toJSON(this.sidebar));
	this.topics.items = books;
	this.sidebar.topics.setTopics(this.topics);
	//logme(Json.toJSON(this.topic));
	
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
			this.observerService.notifyObservers(null, "firenyx:friend:update", Json.toJSON(f));
		} else {
			//friend remove
			this.sidebar.removePeople(f.username);
			this.observerService.notifyObservers(null, "firenyx:friend:remove", Json.toJSON(f));
		}
	}
	for(var i=0; i < friends.length; i++) {
		var f = friends[i];
		var found = false;
		for(var y=0; y < this.friends.length;y++) if (f.username == this.friends[y].username) {found=true; break;}
		if (!found) {
			//friend add
			this.sidebar.addPeople(f.username, f.id, this.generated-f.refresh);
			this.observerService.notifyObservers(null, "firenyx:friend:add", Json.toJSON(f));
		}
	}
	
	this.friends = friends; 
	
	this.firstlogin = false;
	var val = this.topics.unreaded;
	if (fn_p.getInt('look.statusbar_counter', 0) == 1) val = this.topics.items.length; 
	
	if (mail_count >= 0) val = val + '/' + mail_count; 
	
	gBI('firenyx-label').value = fn_utils.printf(fn_s.get('fn.statusbar.text'), this.username, val);
}
firenyx.prototype.openPage = function(page, e) {
	//page = 'l=gate'
	var username = fn_p.getString('username', null);
	
	//var password = fn_p.getString('webpassword', null);
	var fn_pm = new fn_PasswordManager(FIRENYX_CHROME_BASE+'webpassword');
	var password = fn_pm.get(username);
	fn_pm = null;
	
	if (this.disabled) return;
	
	if (!username || !password) {
		alert(fn_s.get('fn.main.alert.need_webpassword'));
		return;
	}
	
	var invisible = fn_p.getInt('invisible_mode', 0);
	if (invisible == 2) {
		//zeptame se zda visible / invisible
		var pSI= Components.interfaces.nsIPromptService;
		var pS = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(pSI);
		var result = pS.confirmEx(null, fn_s.get('fn.invisible_prompt.title'),
															fn_s.get('fn.invisible_prompt.text'),
															pSI.BUTTON_TITLE_IS_STRING * pSI.BUTTON_POS_0 +
															pSI.BUTTON_TITLE_IS_STRING * pSI.BUTTON_POS_1 +
															/*pSI.BUTTON_TITLE_IS_STRING * pSI.BUTTON_POS_2 +*/ pSI.BUTTON_POS_0_DEFAULT,
															fn_s.get('fn.invisible_prompt.invisible'),
															fn_s.get('fn.invisible_prompt.visible'),
															null, //fn_s.get('fn.invisible_prompt.cancel'),
															null,
															{});
		//alert(result);
		//if (result == 1) return;
		//if (result == 2) result=1;
		invisible = 1 - result;
	}
	
	var protocol = 'http';
	if (fn_p.getBool('premium_version', false)) protocol = 'https';
	
	var openUrlMethod = fn_p.getInt('open_url_method', 1);
	var loadInBackground = fn_Pref.getBool("browser.tabs.loadBookmarksInBackground", false);
	
	var where = whereToOpenLink(e, false, false);
	switch(where) {
		case 'tabshifted':
			loadInBackground = !loadInBackground;
			// fall through 
		case 'tab':
			openUrlMethod = 1;
			break;
		case 'window':
			openUrlMethod = 0;
			break;
		case 'current':
		default:
			break;
	}
	 
	var login_url = fn_utils.printf(url_nyx_login_page, 'https');
	var login_params = fn_utils.printf(url_nyx_login_post_vars, encodeURIComponent(username), encodeURIComponent(password), invisible);

	this.xmllogin = new XMLHttpRequest();
	this.xmllogin.open("POST", login_url, true);
	this.xmllogin.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	var callback = function() {
		//logme(this.xmllogin.readyState);
		if (this.xmllogin.readyState == 4) {
			//logme(this.xmllogin.status);
			if (this.xmllogin.status == 200) {
				var url = fn_utils.printf(url_nyx_page, protocol, page);
				//logme(url);
				//If the open tabs preference is set to true
				//logme(this.xmllogin.responseText);
				if(openUrlMethod==0) {
					window.open(url);
				} else if(openUrlMethod==1) {
					//getBrowser().selectedTab = getBrowser().addTab(url);
					var new_tab = getBrowser().addTab(url);
					if (!loadInBackground) getBrowser().selectedTab = new_tab;
				} else if(openUrlMethod==2) {
					getBrowser().selectedBrowser.loadURI(url);
				} else {
					try {
						var num = getBrowser().browsers.length;
						found = -1;
						for (var i = 0; i < num; i++) {
							var br = getBrowser().browsers[i];
							try {
								if (br.currentURI.host.toLowerCase() == 'www.nyx.cz') { found = i;}
							} catch(ex) {}
						}
						if (found != -1) {
							getBrowser().selectedTab = getBrowser().mTabContainer.childNodes[found];
							getBrowser().browsers[found].loadURI(url);
						} else {
							getBrowser().selectedTab = getBrowser().addTab(url);
						}
					} catch(e) {
						Components.utils.reportError(e);
					}
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
	//var password = fn_p.getString('webpassword', null);
	var fn_pm = new fn_PasswordManager(FIRENYX_CHROME_BASE+'webpassword');
	var password = fn_pm.get(username);
	fn_pm = null;
	
	if (!username || !password) {
		alert(fn_s.get('fn.main.alert.need_webpassword'));
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
firenyx.prototype.showAbout = function() {
	window.openDialog(fn_about_xul, 'fn_about', 'centerscreen, chrome, modal', this);
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
firenyx.prototype.upgradeSettings = function() {
	if (fn_p.getString('password', null) != null) {
		var fn_pm = new fn_PasswordManager(FIRENYX_CHROME_BASE+'password');
		fn_pm.set(fn_p.getString('username', null), fn_p.getString('password', null));
		fn_pm = null;
		
		fn_p.clear('password');
	}
	if (fn_p.getString('webpassword', null) != null) {
		var fn_pm = new fn_PasswordManager(FIRENYX_CHROME_BASE+'webpassword');
		fn_pm.set(fn_p.getString('username', null), fn_p.getString('webpassword', null));
		fn_pm = null;
		
		fn_p.clear('webpassword');
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
