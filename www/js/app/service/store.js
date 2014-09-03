/**
* crud notifications in local storage
*/
define(function(require, exports, module) {

	var config = require('app/config');
	var util = require('app/util');

	function _save(key, data){
		
		if(config.dropstore){
			window.localStorage.removeItem(key);
		}

		var blob = window.localStorage.getItem(key);
		var json = {};
		if(blob){
			json = JSON.parse(blob);
		}
		// #TODO for data has Chinese, the text has encoded as Unicode,
		// but here does not handle it, so now we get messy code.
		// need to fix it for Beta
		json[data.url] = {
				type : data.type,
				alert : data.alert,
				date : util.getDate()
		};
		console.log('[DEBUG] save notifications ... ' + JSON.stringify(json));
		window.localStorage.setItem(key, JSON.stringify(json));
	}

	function _get(key){
		var json = {};
		var blob = window.localStorage.getItem(key);
		if(blob){
			json = JSON.parse(blob);
		}
		return json;
	}

	exports.save = _save;
	exports.get = _get;
});