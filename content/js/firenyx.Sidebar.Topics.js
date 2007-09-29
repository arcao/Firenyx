////////////////////////////////////////////////////////////////////////////////
//topics on sidebar
function firenyx_sidebar_topics(treeObject) {
	this._topics = {'items': [], 'cats': [], 'unreaded':0};
	this._mytopics = []; 
	this.treeObject = treeObject;
	this.treeObject.setAttribute('onclick', 'checkForMiddleClick(this, event);');
	this.treeObject.setAttribute('ondblclick', 'fn.sidebar.topics.onClick(event);');
	this.treeObject.setAttribute('oncommand', 'fn.sidebar.topics.onClick(event);');
	return this; 
}
firenyx_sidebar_topics.prototype = {
	QueryInterface: function QueryInterface(aIID) {
		if (Components.interfaces.nsITreeView.equals(aIID) ||
			Components.interfaces.nsIClassInfo.equals(aIID) ||
			Components.interfaces.nsISupportsWeakReference.equals(aIID) ||
			Components.interfaces.nsISupports.equals(aIID)) return this;
		throw 0x80004002; // Components.results.NS_NOINTERFACE;
	},
	/* nsIClassInfo */
	getInterfaces: function getInterfaces(count) {
		count.value = 4;
		return [Components.interfaces.nsITreeView, Components.interfaces.nsIClassInfo, Components.interfaces.nsISupportsWeakReference, Components.interfaces.nsISupports];
	},
	
	getHelperForLanguage: function getHelperForLanguage(language) { return null; },
	get contractID() { return null; },
	get classDescription() { return "myTreeView"; },
	get classID() { return null; },
	
/*	get implementationLanguage() { return Components.interfaces.nsIProgrammimgLanguage.JAVASCRIPT; }, */
	get flags() { return Components.interfaces.nsIClassInfo.MAIN_THREAD_ONLY | Components.interfaces.nsIClassInfo.DOM_OBJECT; },
	/* nsITreeView methods go here */

	treeBox: null,
	selection: null,

	get wrappedJSObject() { return this; }, 
	get rowCount() { return this._mytopics.length; },
	setTree: function(treeBox){ 
		this.treeBox = treeBox;
	},
	getCellText: function(row,column){	
		if (column.id=='topic') return this._mytopics[row].name;
		if (column.id=='unreaded' && this.getLevel(row) != 0) return this._mytopics[row].unreaded; 
		return '';
	},
	isContainer: function(row){ return (this.getLevel(row) == 0); },
	isContainerOpen: function(row){ if (this.getLevel(row) == 0) return true; return false;},
	isContainerEmpty: function(row){
		return true;
		if (this.getLevel(row) == 0) {
		  if (row < this._mytopics.length-1 && this._mytopics[row+1].type!='category') return false; 
		  return true;
		}
		return true;
	},
	isSeparator: function(row){ return false; },
	isSorted: function(){ return false; },
	isEditable: function(idx, column){ return false; },

	getParentIndex: function(row){ 
		if (this.getLevel(row) == 0) return -1;
		
		return this._mytopics[row].parent;
	},
	getLevel: function(row){
		if (this._mytopics[row].type == 'category') return 0; 
		return 1;
	},
	hasNextSibling: function(row, afterIndex){
		if (row == this._mytopics.length - 1) return false;
		
		if (this._mytopics[row].type==this._mytopics[row+1].type) return true;
		return false;
	},
	toggleOpenState: function(row){},

	getImageSrc: function(idx, column) {},
	getProgressMode : function(idx,column) {},
	getCellValue: function(idx, column) {},
	cycleHeader: function(col, elem) {},
	selectionChanged: function() {},
	cycleCell: function(idx, column) {},
	performAction: function(action) { logme(action);},
	performActionOnCell: function(action, index, column) {logme(action+"; "+index+"; "+column);},
	getRowProperties: function(idx, column, prop) {},
	getCellProperties: function(idx, column, prop) {},
	getColumnProperties: function(column, element, prop) {},
	
	canDrop: function(index, orientation){ return false; },
	drop: function(row, orientation){},
	getCellValue: function(row, col){ return "";},
	performActionOnRow: function(action, row){logme(action+"; "+row);},
	selectionChanged: function(){},
	setCellText: function(row, col, value){},
	setCellValue: function(row, col, value){},
	canDropOn: function canDropOn(index) { return false; },
	canDropBeforeAfter: function canDropBeforeAfter(index, before) { return false; },
	drop: function drop(index, orientation) { },
	
	onClick: function(event) {
		//logme(event);
		if (this.treeObject.currentIndex==-1) return;
		
		var item = this._mytopics[this.treeObject.currentIndex];
		if (item.type=='category' || item.id == 0) return;
		
		fn.openPage('l=topic;id='+item.id, event);
	},

	setTopics: function(topics) {
		if (this.treeBox) this.treeBox.beginUpdateBatch();
		this._topics = topics;
		this.sortTopics();
		if (this.treeBox) this.treeBox.endUpdateBatch();
	},
	sortTopics: function() {
		this._mytopics = [];
		var i = 0;
		var parent = 0;
		var cat_name = '';
		var item = null;
		
		for(var x = 0; x < this._topics.cats.length; x++) {
			cat_name = this._topics.cats[x].name;
			this._mytopics.push({'name': cat_name, 'type': 'category', 'unreaded': 0, 'id': 0});
			parent = i;
			i+= 1;
			for(var y = 0; y < this._topics.items.length; y++) {
				item = this._topics.items[y];
				if (item.cat_name == cat_name) {
					this._mytopics.push({'name': item.name, 'type': 'topic', 'unreaded': item.unreaded, 'id': item.id, 'parent': parent});
					i+= 1;
				}
			}
		}
	},
	destroy: function() {
	}
}