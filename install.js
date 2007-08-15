// Another XpiInstaller
// By MonkeeSage 
// (Heavily inspired by code from Pike, who was...)
// (Heavily inspired by code from Henrik Gemal and Stephen Clavering)

var XpiInstaller = {

  // --- Editable items begin ---
  extFullName    : 'Firenyx', // The name displayed to the user (don't include the version)
  extShortName   : 'firenyx', // The leafname of the JAR file (without the .jar part)
  extVersion     : '0.1.0.2007070402',
  extAuthor      : 'Arcao',
  extLocaleNames : ['cs-CZ'],
  extSkinNames   : [], // e.g., ['classic','modern']
  extPreferences : ['firenyx.js'], // e.g., ['extension.js']
  extPostInstallMessage: null, // Set to null for no post-install message
  // --- Editable items end ---
  
  profileInstall : true,
  silentInstall  : false,
  
  install: function() {
  
    var jarName    = this.extShortName + '.jar';
    var profileDir = Install.getFolder('Profile','chrome');
    var globalDir  = Install.getFolder('Chrome');
    
    // Parse HTTP arguments
    this.parseArguments();
    
    // Check if extension is already installed in profile
    if (File.exists(Install.getFolder(profileDir, jarName))) {
       if (!this.silentInstall) {
          Install.alert('Doplnìk ' + 
                        this.extFullName + ' je již nainstalovaný a bude upgradován na verzi ' + this.extVersion + '.');
       }
       this.profileInstall = true;
    }
    else if (!this.silentInstall) {
       // Ask user for install location, profile or browser dir?
       this.profileInstall = Install.confirm('Instalovat ' + this.extFullName + ' ' + 
                             this.extVersion + ' do adresáøe vašeho profilu (pouze pro vás) [OK] nebo ' +
                             'do adresáøe prohlížeèe (pro všechny uživatele) [Storno]?');
    }
    
    // Init install
    var dispName = this.extFullName + ' ' + this.extVersion;
    var regName  = '/' + this.extAuthor + '/' + this.extShortName;
    Install.initInstall(dispName, regName, this.extVersion);
    
    // Find directory to install into
    var installPath;
    if (this.profileInstall) {
       installPath = profileDir;
    }
    else {
       installPath = globalDir;
    }
    
    // Add JAR file
    Install.addFile(null, 'chrome/' + jarName, installPath, null);
    
    // Register chrome
    var jarPath = Install.getFolder(installPath, jarName);
    var installType = (this.profileInstall ? Install.PROFILE_CHROME : Install.DELAYED_CHROME);
    
    // Register content
    Install.registerChrome(Install.CONTENT | installType, jarPath, 
                          'content/' + this.extShortName + '/');
    
    // Register locales
    for (var locale in this.extLocaleNames) {
       var regPath = 'locale/' + this.extLocaleNames[locale] + '/' + this.extShortName + '/';
       Install.registerChrome(Install.LOCALE | installType, jarPath, regPath);
    }
    
    // Register skins
    for (var skin in this.extSkinNames) {
       var regPath = 'skin/' + this.extSkinNames[skin] + '/' + this.extShortName + '/';
       Install.registerChrome(Install.SKIN | installType, jarPath, regPath);
    }
    
    // Copy preference files
    for (var pref in this.extPreferences) {
       var prefFolder = getFolder('Program','defaults/pref/');
       addFile(this.extAuthor, 'defaults/preferences/' + 
               this.extPreferences[pref], prefFolder, null);
    }
  
    // Perform install
    var err = Install.performInstall();
    if (err == Install.SUCCESS || err == Install.REBOOT_NEEDED) {
       if (!this.silentInstall && this.extPostInstallMessage) {
          Install.alert('Doplnìk ' + this.extFullName + ' ' + this.extVersion     + 
                        ' byl úspìšnì nainstalován.\n\n' +
                         jarPath + '\n\n' + this.extPostInstallMessage);
       }
    }
    else   {
       this.handleError(err);
       return;
    }
  },
  
  parseArguments: function()   {
    // Can't use string handling in install, so use if statement instead
    var args = Install.arguments;
    if (args == 'p=0') {
       this.profileInstall = false;
       this.silentInstall = true;
    }
    else if (args == 'p=1')   {
       this.profileInstall = true;
       this.silentInstall = true;
    }
  },
  
  handleError: function(err)   {
    if (!this.silentInstall) {
       Install.alert('Chyba: Nepovedlo se nainstalovat ' + this.extFullName + ' ' + this.extVersion +
                     ' (Chybový kód: ' + err + ')');
    }
    Install.cancelInstall(err);
  }
};

XpiInstaller.install();
