const APP_AUTHOR		= "Arcao";
const APP_CONTRIBUTOR		= "Esten";
const APP_NAME			= "Firenyx";
const APP_CHROME_NAME	= "firenyx";
const APP_VERSION		= "0.1.5.2007100601";
const APP_FILE 			= "chrome/firenyx.jar";
const APP_FILE2 		= "firenyx.jar";
const APP_CONTENTS_PATH		= "content/";
const LOCALE_CONTENTS_PATH		= "locale";
const APP_SKIN_FOLDER	 = "skin/firenyx/";
const LOCALE_LIST    = ["en-US", "cs-CZ"];

// Mozilla Suite/Seamonkey stores all pref files in a single directory
// under the application directory.  If the name of the preference file(s)
// is/are not unique enough, you may override other extension preferences.
// set this to true if you need to prevent this.
var prefFolder          = getFolder(getFolder("Program", "defaults"), "pref");
var disambiguatePrefs   = true
const prefs               = new Array( "firenyx.js" );

initInstall(APP_NAME, APP_CHROME_NAME, APP_VERSION); 

// var chromeFolder = getFolder("Current User", "chrome");
var chromeFolder = getFolder("Profile", "chrome");
setPackageFolder(chromeFolder);
// error = addFile(APP_NAME, APP_FILE, chromeFolder, "");
error = addFile(APP_NAME, APP_VERSION, APP_FILE, chromeFolder, null);
//if (error != SUCCESS)
//	alert('err1 ' + error);

var jarFolder = getFolder(chromeFolder, APP_FILE2);
registerChrome(CONTENT | PROFILE_CHROME, jarFolder, APP_CONTENTS_PATH);
registerChrome(SKIN | PROFILE_CHROME, jarFolder, APP_SKIN_FOLDER);
for (var x = 0; x < LOCALE_LIST.length; x++)
  registerChrome(LOCALE | PROFILE_CHROME, jarFolder, 	
  		LOCALE_CONTENTS_PATH+ "/" +LOCALE_LIST[x]+"/"+APP_CHROME_NAME+"/");


    for (var i = 0; i < prefs.length; i++) {
        if (!disambiguatePrefs) {
            addFile(APP_CHROME_NAME + " Defaults", APP_VERSION, "defaults/preferences/" + prefs[i],
                prefFolder, prefs[i], true);
        } else {
            addFile(APP_CHROME_NAME + " Defaults", APP_VERSION, "defaults/preferences/" + prefs[i],
                prefFolder, APP_CHROME_NAME + "-" + prefs[i], true);
        }
    }


var result = getLastError(); 
if(result == SUCCESS) 
{
	error = performInstall();
//	if (error != SUCCESS)
//		alert('err3 ' + error);
} 
else 
{
//	alert('err2 ' + result);
	cancelInstall(result);
}
