////////////////////////////////////////////////////////////////////////////////
//Password manager
function fn_PasswordManager(chromeURL) {
	this.chromeURL = chromeURL;
  this.wrappedJSObject = this;
  this._passwordManager = Components.classes["@mozilla.org/passwordmanager;1"];
	this._loginManager = Components.classes["@mozilla.org/login-manager;1"];

  return this;
}
////////////////////////////////////////////////////////////////////////////////
fn_PasswordManager.prototype.set = function(username, password) {
	var old_password = this.get(username);

	if (old_password == null && password != null) {
		this.create(username, password);		
	} else if (old_password != null && password == null) {
		this.remove(username);
	} else if (old_password != null && password != null) {
		this.changePassword(username, password);
	}
}
////////////////////////////////////////////////////////////////////////////////
fn_PasswordManager.prototype.get = function(username) {
	var password = null;
	
	if (this._passwordManager != null) {
		// Password Manager exists so this is not Firefox 3 (could be Firefox 2, Netscape, SeaMonkey, etc).
		// Password Manager code
		var passwordManager = this._passwordManager.getService(Components.interfaces.nsIPasswordManager);

		var e = passwordManager.enumerator;

		// step through each password in the password manager until we find the one we want:
		while (e.hasMoreElements()) {
			try {
				// get an nsIPassword object out of the password manager.
				// This contains the actual password...
				var pass = e.getNext().QueryInterface(Components.interfaces.nsIPassword);

				if (pass.host == this.chromeURL && pass.user == username) {
					// found it!
					password = pass.password; // the password
					break;
				}
			} catch (ex) {
				// do something if decrypting the password failed--probably a continue
			}
		}
		passwordManager = null;
	} else if (this._loginManager!= null) {
		// Login Manager exists so this is Firefox 3
		// Login Manager code
		var loginManager = this._loginManager.getService(Components.interfaces.nsILoginManager);
		var logins = loginManager.findLogins({}, this.chromeURL, null, 'Nyx login');
		//logme(logins.length);
		
		for (var i = 0; i < logins.length; i++) {
			//logme(logins[i].username);
			if (logins[i].username == username) {
				// found it!
				password = logins[i].password;
				break;
			}
		}
		loginManager = null;
	}
	return password;
}
////////////////////////////////////////////////////////////////////////////////
fn_PasswordManager.prototype.create = function(username, password) {
	if (this._passwordManager != null) {
		// Password Manager exists so this is not Firefox 3 (could be Firefox 2, Netscape, SeaMonkey, etc).
		// Password Manager code
		var passwordManager = this._passwordManager.getService(Components.interfaces.nsIPasswordManager);
		passwordManager.addUser(this.chromeURL, username, password);
		passwordManager = null;
	} else if (this._loginManager!= null) {
		// Login Manager exists so this is Firefox 3
		// Login Manager code
		var loginManager = this._loginManager.getService(Components.interfaces.nsILoginManager);
		var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1", Components.interfaces.nsILoginInfo, "init");
		
		var extLoginInfo = new nsLoginInfo(this.chromeURL, null, 'Nyx login', username, password, "", "");
		loginManager.addLogin(extLoginInfo);
		
		extLoginInfo = null;
		nsLoginInfo = null;
		loginManager = null;
	}
}
////////////////////////////////////////////////////////////////////////////////
fn_PasswordManager.prototype.remove = function(username) {
	if (this._passwordManager != null) {
		// Password Manager exists so this is not Firefox 3 (could be Firefox 2, Netscape, SeaMonkey, etc).
		// Password Manager code
		var passwordManager = this._passwordManager.getService(Components.interfaces.nsIPasswordManager);
		try {
			passwordManager.removeUser(this.chromeURL, username);
		} catch (e) {}
		passwordManager = null;
	} else if (this._loginManager!= null) {
		// Login Manager exists so this is Firefox 3
		// Login Manager code
		var loginManager = this._loginManager.getService(Components.interfaces.nsILoginManager);
		var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1", Components.interfaces.nsILoginInfo);
		
		var logins = loginManager.findLogins({}, this.chromeURL, null, 'Nyx login');
		//logme(logins.length);
		for (var i = 0; i < logins.length; i++) {
			//logme(logins[i].username);
			if (logins[i].username == username) {
				loginManager.removeLogin(logins[i]);
				break;
			}
		}
		nsLoginInfo = null;
		loginManager = null;
	}
}
////////////////////////////////////////////////////////////////////////////////
fn_PasswordManager.prototype.changePassword = function(username, password) {
	this.remove(username);
	this.create(username, password);
}
////////////////////////////////////////////////////////////////////////////////
fn_PasswordManager.prototype.changeUsername = function(old_username, new_username) {
	var password = this.get(old_username);
	this.remove(old_username);
	this.create(new_username, password);
}