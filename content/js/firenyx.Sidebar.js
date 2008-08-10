////////////////////////////////////////////////////////////////////////////////
//sidebar
function firenyx_sidebar() {
	if (gBI('firenyx-topics')) {
		this.topics = new firenyx_sidebar_topics(gBI('firenyx-topics'));
		this.toggleSidebar(fn_p.getBool('show_sidebar', false));
	}
	return this;
}
firenyx_sidebar.prototype.toggleSidebar = function(show) {
	if (show == undefined) {
		if (fn_p.getBool('disabled', false)) return;
		var hidden = !(gBI('firenyx-dashboard').hidden);
	} else {
		var hidden = !show;
	}
	if (!hidden) this.loadTab();
	
	gBI('firenyx-dashboard').hidden = hidden;
	gBI('firenyx-dashboard-splitter').hidden = hidden;
	gBI('firenyx-topics').view=this.topics;

	try{ gBI('firenyx-toggleSidebar-0').setAttribute('checked', !hidden); } catch(e) {};	
	try{ gBI('firenyx-toggleSidebar-1').setAttribute('checked', !hidden); } catch(e) {};
	try{ gBI('firenyx-toggleSidebar-2').setAttribute('checked', !hidden); } catch(e) {};
	
	fn_p.setBool('show_sidebar', !hidden);
}
firenyx_sidebar.prototype.saveTab = function(index) {
	fn_p.setInt('last_sidebar_tab', index);
}
firenyx_sidebar.prototype.loadTab = function() {
	var tab = fn_p.getInt('look.default_sidebar_tab', 0);
	if (tab < 0 || tab > 2) tab = 0;
	
	if (tab == 2){
		tab = fn_p.getInt('last_sidebar_tab', 0);
	}
	gBI('firenyx-dashboard-tab-box').selectedIndex = tab;
}
firenyx_sidebar.prototype.addPeople = function(nick, time) {
	nick = nick.toUpperCase();

	var list = gBI('firenyx-friends');
	
	var items = list.getElementsByTagName('richlistitem');
	
	var beforeEl = null;
	
	for(var i=0; i<items.length; i++) {
		if(items[i].nick>nick) { beforeEl = items[i]; break; }
	}
	
	var el = document.createElement('richlistitem');
	
	el.nick = nick;
	el.setAttribute('context', 'popupmenu_friends');
	el.setAttribute('tooltiptext', fn_utils.printf(fn_s.get('fn.sidebar.people.tooltip'), nick, fn_utils.formatAgoTime(time)));
	el.setAttribute('ondblclick', "fn.sidebar.menuAction('newmail', event);");
	
	var hbox = document.createElement('hbox');
	hbox.setAttribute('crop', 'end');
	
	var image = document.createElement('image');
	image.setAttribute('src', fn_utils.printf(url_nyx_avatars, nick.substring(0,1), nick));
	image.onerror = function() { image.src=fn_img_avatar_error;};
	
	var vboxImage = document.createElement('vbox');
	var vbox = document.createElement('vbox');
	
	var label_nick = document.createElement('label');
	label_nick.setAttribute('value', nick);
	label_nick.setAttribute('class', 'nick');
	label_nick.setAttribute('crop', 'end');
	var label_time = document.createElement('label');
	label_time.setAttribute('value', fn_utils.printf(fn_s.get('fn.activity'), fn_utils.formatAgoTime(time)));
	label_time.setAttribute('class', 'time');
	label_time.setAttribute('crop', 'end');
	
	vbox.appendChild(label_nick);
	//vbox.appendChild(document.createElement('spacer'));
	vbox.appendChild(label_time);
	
	vboxImage.appendChild(image);
	
	hbox.appendChild(vboxImage);
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
		//logme(items[i].nick);
		if(items[i].nick==nick) { el = items[i]; break; }
	}
	
	if (el) {
		el.getElementsByTagName('label')[1].setAttribute('value', fn_utils.printf(fn_s.get('fn.activity'), fn_utils.formatAgoTime(time)));
		el.setAttribute('tooltiptext', fn_utils.printf(fn_s.get('fn.sidebar.people.tooltip'), nick, fn_utils.formatAgoTime(time)));
		//logme(el.getElementsByTagName('label')[1].value);
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

firenyx_sidebar.prototype.removeAllPeople = function() {
	var list = gBI('firenyx-friends');
	
	while (list.getRowCount() > 0) list.removeItemAt(0);
}

firenyx_sidebar.prototype.menuAction = function(action, event) {
	var item = gBI('firenyx-friends').selectedItem;
	switch(action.toLowerCase()) {
		case 'newmail':
			fn.showWriteMail(item.nick);
			break;
		case 'userinfo':
			fn.openPage('l=user;id='+item.nick, event);
			break;
	}
}