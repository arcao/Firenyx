////////////////////////////////////////////////////////////////////////////////
//sidebar
function firenyx_sidebar() {
	if (gBI('firenyx-topics')) this.topics = new firenyx_sidebar_topics(gBI('firenyx-topics'));
	return this;
}
firenyx_sidebar.prototype.toggleSidebar = function(show) {
	if (show == undefined) {
		if (fn_p.getBool('disabled', false)) return;
		var hidden = !(gBI('firenyx-dashboard').hidden);
	} else {
		var hidden = !show;
	}
	
	gBI('firenyx-dashboard').hidden = hidden;
	gBI('firenyx-dashboard-splitter').hidden = hidden;
	gBI('firenyx-topics').view=this.topics;

	try{ gBI('firenyx-toggleSidebar-0').setAttribute('checked', !hidden); } catch(e) {};	
	try{ gBI('firenyx-toggleSidebar-1').setAttribute('checked', !hidden); } catch(e) {};
	try{ gBI('firenyx-toggleSidebar-2').setAttribute('checked', !hidden); } catch(e) {};
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
	el.setAttribute('context', 'popupmenu_friends');
	el.setAttribute('tooltiptext', fn_utils.printf(fn_s.get('fn.sidebar.people.tooltip'), nick, fn_utils.formatTime(time)));
	el.setAttribute('ondblclick', "fn.sidebar.menuAction('newmail', event);");
	
	var hbox = document.createElement('hbox');
	
	var image = document.createElement('image');
	image.setAttribute('src', fn_utils.printf(url_nyx_avatars, nick.substring(0,1), nick));
	image.onerror = function() { image.src=fn_img_avatar_error;};
	
	var vbox = document.createElement('vbox');
	
	var label_nick = document.createElement('label');
	label_nick.setAttribute('value', nick);
	label_nick.setAttribute('class', 'nick');
	var label_time = document.createElement('label');
	label_time.setAttribute('value', fn_utils.formatTime(time));
	label_time.setAttribute('class', 'time');
	
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
		//logme(items[i].nick);
		if(items[i].nick==nick) { el = items[i]; break; }
	}
	
	if (el) {
		el.getElementsByTagName('label')[1].value = fn_utils.formatTime(time);
		el.setAttribute('tooltiptext', fn_utils.printf(fn_s.get('fn.sidebar.people.tooltip'), nick, fn_utils.formatTime(time)));
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