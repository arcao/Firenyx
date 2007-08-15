function fn_about_init() {
	try {
		var version = fn_utils.getVersion('{5591137f-ca2c-4c2a-93d1-5514992b2d4a}');
		if (!version) throw new Error('');
		
		var version_obj = gBI('firenyx-about-version');
		if (version_obj.firstChild) version_obj.removeChild(version_obj.firstChild);
		version_obj.appendChild(document.createTextNode(version));
		
		var date_obj = gBI('firenyx-about-date');
		if (date_obj.firstChild) date_obj.removeChild(date_obj.firstChild);
		var v = version.split('.');
		d = v[3].substring(0,8);
		
		year = d.substring(0,4);
		month = d.substring(4,6);
		day = d.substring(6,8);
		
		date = new Date(year, month-1, day, 0, 0, 0);	
		date_obj.appendChild(document.createTextNode(date.toLocaleDateString()));
	} catch (e) {}	
}
function fn_about_destroy() {
}