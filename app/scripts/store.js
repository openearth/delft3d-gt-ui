var exports = (function() {
  "use strict";

  var store = {
  	state: {

  	  thingArray: [
  	  	{id: 0, name: "Name 0", active: false, subobject: {name: "Subname 0"}},
  	  	{id: 1, name: "Name 1", active: false, subobject: {name: "Subname 1"}},
  	  	{id: 2, name: "Name 2", active: false, subobject: {name: "Subname 2"}},
  	  	{id: 3, name: "Name 3", active: false, subobject: {name: "Subname 3"}},
  	  	{id: 4, name: "Name 4", active: false, subobject: {name: "Subname 4"}},
  	  	{id: 5, name: "Name 5", active: false, subobject: {name: "Subname 5"}}
  	  ],

  	  selectedThing: null
  	},
  	update: function () {
  		_.each(this.state.thingArray, function(thing){
  			thing.subobject = {name: "Updated! " + Math.random()}
  		})
  	},
	startSyncModels: function () {
		this.update(this)
		this.interval = setInterval(this.update.bind(this), 300)
	},
	stopSyncModels: function () {
		clearInterval(this.interval)
		this.interval = null
	}

  };

  store.state.selectedThing = store.state.thingArray[0]

  store.startSyncModels()

  return {
    store: store
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
